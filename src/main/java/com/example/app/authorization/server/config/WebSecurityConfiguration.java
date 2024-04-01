package com.example.app.authorization.server.config;

import java.io.IOException;
import java.io.InputStream;
import java.text.ParseException;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ResourceLoader;
import org.springframework.security.oauth2.core.oidc.endpoint.OidcParameterNames;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;

/**
 * Web security configuration.
 */
@Configuration
public class WebSecurityConfiguration {

	/**
	 * Gets the JWKS for encryption/decryption and signing/verification.
	 * @param resourceLoader the resource loader
	 * @param applicationProperties the application properties
	 * @return the JWKS
	 * @throws IOException the exception
	 * @throws ParseException the exception
	 */
	@Bean
	JWKSet jwks(ResourceLoader resourceLoader, ApplicationProperties applicationProperties)
			throws IOException, ParseException {
		try (InputStream inputStream = resourceLoader.getResource(applicationProperties.getJwks()).getInputStream()) {
			return JWKSet.load(inputStream);
		}
	}

	/**
	 * Gets the JWKSource used by the authorization server.
	 * @param jwkSet the JWKS
	 * @return the JWK source
	 */
	@Bean
	JWKSource<SecurityContext> jwkSource(JWKSet jwkSet) {
		return new ImmutableJWKSet<>(jwkSet);
	}

	/**
	 * Customize the token.
	 * @return the token customizer
	 */
	@Bean
	OAuth2TokenCustomizer<JwtEncodingContext> jwtCustomizer() {
		return context -> {
			if (OAuth2TokenType.ACCESS_TOKEN.equals(context.getTokenType())) {
				// Customize the access token
				// The access token alg cannot be configured via yaml
				context.getJwsHeader().algorithm(SignatureAlgorithm.ES512);
			}
			else if (OidcParameterNames.ID_TOKEN.equals(context.getTokenType().getValue())) {
				// Customize the id token
				context.getClaims().claims(claims -> {
					String sub = claims.get("sub").toString();
					claims.put("email", sub + "@example.org");
					// first name
					claims.put("given_name", sub);
					// last name
					claims.put("family_name", sub);
				});
			}
		};
	}

}
