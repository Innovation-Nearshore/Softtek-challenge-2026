package com.softtek.backend.dto;

import com.softtek.backend.model.Area;
import com.softtek.backend.model.Rol;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UsuarioRequest {

    @NotBlank
    private String nombre;

    @NotBlank
    private String username;

    private String password;

    @NotNull
    private Area area;

    @NotNull
    private Rol rol;
}
