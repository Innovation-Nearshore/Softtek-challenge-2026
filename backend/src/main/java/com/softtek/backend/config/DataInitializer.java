package com.softtek.backend.config;

import com.softtek.backend.model.Area;
import com.softtek.backend.model.Rol;
import com.softtek.backend.model.Usuario;
import com.softtek.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsuario("admin", "Admin User", "admin123", Rol.ADMIN, Area.TI);
        seedUsuario("consultor_ti", "Consultor TI", "consultor123", Rol.CONSULTOR, Area.TI);
        seedUsuario("consultor_rrhh", "Consultor RRHH", "consultor123", Rol.CONSULTOR, Area.RRHH);
        seedUsuario("consultor_ops", "Consultor Operaciones", "consultor123", Rol.CONSULTOR, Area.OPERACIONES);
        seedUsuario("consultor_fin", "Consultor Finanzas", "consultor123", Rol.CONSULTOR, Area.FINANZAS);
        seedUsuario("solicitante1", "Solicitante Uno", "solicitante123", Rol.SOLICITANTE, Area.TI);
        seedUsuario("solicitante2", "Solicitante Dos", "solicitante123", Rol.SOLICITANTE, Area.RRHH);
    }

    private void seedUsuario(String username, String nombre, String password, Rol rol, Area area) {
        if (!usuarioRepository.existsByUsername(username)) {
            Usuario u = Usuario.builder()
                    .username(username)
                    .nombre(nombre)
                    .password(passwordEncoder.encode(password))
                    .rol(rol)
                    .area(area)
                    .build();
            usuarioRepository.save(u);
            log.info("Usuario creado: {} [{}]", username, rol);
        } else {
            log.info("Usuario ya existe: {}", username);
        }
    }
}
