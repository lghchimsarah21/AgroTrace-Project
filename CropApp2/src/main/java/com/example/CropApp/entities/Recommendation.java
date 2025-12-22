package com.example.CropApp.entities;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String result;
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime date;
    private Double nitrogen;
    private Double phosphorous;
    private Double pottasium;
    private Double ph;
    private String season;
    private String city;
    private Double temperature;
    private Double humidity;
    private Double rainfall;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private User user;
}