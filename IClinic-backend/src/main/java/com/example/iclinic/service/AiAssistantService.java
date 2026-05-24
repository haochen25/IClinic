package com.example.iclinic.service;

import com.example.iclinic.dto.AiChatMessage;
import com.example.iclinic.dto.AiChatRequest;
import com.example.iclinic.dto.AiChatResponse;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import tools.jackson.databind.json.JsonMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AiAssistantService {

    private static final String SYSTEM_PROMPT = """
            You are a helpful medical clinic assistant.
            Do not diagnose diseases.
            Recommend seeing a doctor for emergencies.
            Provide educational information only.
            """;

    private final HttpClient httpClient;
    private final JsonMapper jsonMapper;
    private final String ollamaBaseUrl;
    private final String ollamaModel;

    public AiAssistantService(
            JsonMapper jsonMapper,
            @Value("${ollama.base-url:http://localhost:11434}") String ollamaBaseUrl,
            @Value("${ollama.model:llama3.1}") String ollamaModel) {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
        this.jsonMapper = jsonMapper;
        this.ollamaBaseUrl = ollamaBaseUrl;
        this.ollamaModel = ollamaModel;
    }

    public AiChatResponse chat(AiChatRequest request) {
        String message = request.message() == null ? "" : request.message().trim();
        if (message.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message is required");
        }

        List<OllamaMessage> messages = new ArrayList<>();
        messages.add(new OllamaMessage("system", SYSTEM_PROMPT));
        if (request.history() != null) {
            request.history().stream()
                    .filter(this::isAllowedHistoryMessage)
                    .limit(10)
                    .map(historyMessage -> new OllamaMessage("user", historyMessage.content().trim()))
                    .forEach(messages::add);
        }
        messages.add(new OllamaMessage("user", message));

        try {
            Map<String, Object> body = Map.of(
                    "model", ollamaModel,
                    "stream", false,
                    "messages", messages,
                    "options", Map.of("temperature", 0.3)
            );

            HttpRequest ollamaRequest = HttpRequest.newBuilder()
                    .uri(URI.create(normalizeBaseUrl(ollamaBaseUrl) + "/api/chat"))
                    .timeout(Duration.ofSeconds(45))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonMapper.writeValueAsString(body)))
                    .build();

            HttpResponse<String> response = httpClient.send(ollamaRequest, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Ollama returned status " + response.statusCode());
            }

            OllamaChatResponse ollamaResponse = jsonMapper.readValue(response.body(), OllamaChatResponse.class);
            String reply = ollamaResponse.message() == null ? null : ollamaResponse.message().content();
            if (reply == null || reply.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Ollama returned an empty response");
            }
            return new AiChatResponse(reply.trim());
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not reach Ollama", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Ollama request was interrupted", e);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Ollama URL", e);
        }
    }

    private boolean isAllowedHistoryMessage(AiChatMessage message) {
        if (message == null || message.content() == null || message.content().isBlank()) {
            return false;
        }
        return true;
    }

    private static String normalizeBaseUrl(String baseUrl) {
        return baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record OllamaChatResponse(@JsonProperty("message") OllamaResponseMessage message) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record OllamaResponseMessage(@JsonProperty("content") String content) {
    }

    private record OllamaMessage(String role, String content) {
    }
}
