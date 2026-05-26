package com.softtek.backend.dto;

import com.softtek.backend.model.Area;
import com.softtek.backend.model.Urgencia;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SolicitudRequest {

    @NotBlank
    private String tipoSolicitud;

    @NotNull
    private Urgencia urgencia;

    @NotBlank
    private String descripcion;

    @NotNull
    private Long solicitanteId;

    @NotNull
    private Area areaDestino;
}
