import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs/operators';
import { AssistantMessage, AssistantService } from '../../services/assistant.service';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './ai-assistant.component.html',
  styleUrl: './ai-assistant.component.scss',
})
export class AiAssistantComponent {
  @ViewChild('thread') private readonly thread?: ElementRef<HTMLDivElement>;

  private readonly assistant = inject(AssistantService);

  readonly quickPrompts = [
    'How do I register a new patient?',
    'What should I check before booking an appointment?',
    "Where can I find today's waiting room?",
  ];

  isOpen = false;
  isLoading = false;
  draft = '';
  error = '';
  messages: AssistantMessage[] = [
    {
      role: 'assistant',
      content: 'Hi, I can help with IClinic workflow questions. What do you need?',
    },
  ];

  toggle(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.scrollToLatest();
    }
  }

  usePrompt(prompt: string): void {
    this.draft = prompt;
    this.send();
  }

  handleEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.shiftKey) {
      return;
    }
    keyboardEvent.preventDefault();
    this.send();
  }

  send(): void {
    const message = this.draft.trim();
    if (!message || this.isLoading) {
      return;
    }

    const history = this.messages.slice(-10);
    this.messages = [...this.messages, { role: 'user', content: message }];
    this.draft = '';
    this.error = '';
    this.isLoading = true;
    this.scrollToLatest();

    this.assistant
      .chat(message, history)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: ({ reply }) => {
          this.messages = [...this.messages, { role: 'assistant', content: reply }];
          this.scrollToLatest();
        },
        error: (err: Error) => {
          this.error = err.message || 'The assistant could not respond.';
          this.scrollToLatest();
        },
      });
  }

  private scrollToLatest(): void {
    setTimeout(() => {
      if (this.thread?.nativeElement) {
        this.thread.nativeElement.scrollTop = this.thread.nativeElement.scrollHeight;
      }
    });
  }
}
