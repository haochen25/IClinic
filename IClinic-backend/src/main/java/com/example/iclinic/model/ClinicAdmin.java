package com.example.iclinic.model;

import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "admin_staff")
@PrimaryKeyJoinColumn(name = "id", referencedColumnName = "id")
public class ClinicAdmin extends Staff {
}
