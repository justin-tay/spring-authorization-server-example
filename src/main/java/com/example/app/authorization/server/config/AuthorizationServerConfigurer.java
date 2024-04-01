package com.example.app.authorization.server.config;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer;

/**
 * Configurer for OAuth2AuthorizationServer.
 */
public class AuthorizationServerConfigurer extends AbstractHttpConfigurer<AuthorizationServerConfigurer, HttpSecurity> {

	@Override
	public void init(HttpSecurity http) throws Exception {
		OAuth2AuthorizationServerConfigurer authorizationServerConfigurer = http
			.getConfigurer(OAuth2AuthorizationServerConfigurer.class);
		// Only attempt to configure if already present
		if (authorizationServerConfigurer != null) {
			authorizationServerConfigurer.oidc(oidc -> oidc
				.providerConfigurationEndpoint(providerConfigurationEndpoint -> providerConfigurationEndpoint
					.providerConfigurationCustomizer(providerConfiguration -> {
						providerConfiguration.idTokenSigningAlgorithms(idTokenSigningAlgorithms -> {
							idTokenSigningAlgorithms.clear();
							idTokenSigningAlgorithms.add(SignatureAlgorithm.ES512.getName());
						}).tokenEndpointAuthenticationMethods(tokenEndpointAuthenticationMethods -> {
							tokenEndpointAuthenticationMethods.clear();
							tokenEndpointAuthenticationMethods
								.add(ClientAuthenticationMethod.PRIVATE_KEY_JWT.getValue());
						})
							.tokenRevocationEndpointAuthenticationMethods(
									tokenRevocationEndpointAuthenticationMethods -> {
										tokenRevocationEndpointAuthenticationMethods.clear();
										tokenRevocationEndpointAuthenticationMethods
											.add(ClientAuthenticationMethod.PRIVATE_KEY_JWT.getValue());
									})
							.tokenIntrospectionEndpointAuthenticationMethods(
									tokenIntrospectionEndpointAuthenticationMethods -> {
										tokenIntrospectionEndpointAuthenticationMethods.clear();
										tokenIntrospectionEndpointAuthenticationMethods
											.add(ClientAuthenticationMethod.PRIVATE_KEY_JWT.getValue());
									})
							.grantTypes(grantTypes -> {
								grantTypes.clear();
								grantTypes.add(AuthorizationGrantType.AUTHORIZATION_CODE.getValue());
								grantTypes.add(AuthorizationGrantType.CLIENT_CREDENTIALS.getValue());
								grantTypes.add(AuthorizationGrantType.REFRESH_TOKEN.getValue());
							});
					})));
		}
	}

}
