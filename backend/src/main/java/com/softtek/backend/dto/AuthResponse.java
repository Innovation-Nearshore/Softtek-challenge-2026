package com.softtek.backend.dto;

import com.softtek.backend.model.Area;
import com.softtek.backend.model.Rol;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private Long id;
    private String username;
    private String nombre;
    private Rol rol;
    private Area area;
}
