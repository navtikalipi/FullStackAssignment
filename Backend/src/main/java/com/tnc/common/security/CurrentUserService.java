package com.tnc.common.security;

import com.tnc.common.exception.AuthenticationException;
import com.tnc.domain.user.entity.User;
import com.tnc.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;

    public Long getCurrentUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new AuthenticationException("Unauthorized user");
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new AuthenticationException("Authenticated user not found"));

        return user.getId();
    }
}
