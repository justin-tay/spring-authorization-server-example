package com.example.app.authorization.server.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Application properties.
 */
@Configuration(proxyBeanMethods = false)
@ConfigurationProperties(prefix = "app")
public class ApplicationProperties {

	private String jwks;

	public String getJwks() {
		return this.jwks;
	}

	public void setJwks(String jwks) {
		this.jwks = jwks;
	}

}
