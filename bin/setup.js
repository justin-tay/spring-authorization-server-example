const KEYCLOAK_ADMIN = process.env.KEYCLOAK_ADMIN ?? 'admin';
const KEYCLOAK_ADMIN_PASSWORD = process.env.KEYCLOAK_ADMIN_PASSWORD ?? 'admin';
const KEYCLOAK_SERVER = process.env.KEYCLOAK_SERVER ?? 'http://localhost:8080';
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM ?? 'test';
const KEYCLOAK_IDENTITY_PROVIDER =
  process.env.KEYCLOAK_IDENTITY_PROVIDER ?? 'spring-authorization-server';
const KEYCLOAK_IDENTITY_PROVIDER_NAME =
  process.env.KEYCLOAK_IDENTITY_PROVIDER_NAME ?? 'Spring Authorization Server';

const credentials = async ({ server, user, password }) => {
  const response = await fetch(
    `${server}/realms/master/protocol/openid-connect/token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: user,
        password,
        grant_type: 'password',
        client_id: 'admin-cli',
      }),
    }
  );
  const token = await response.json();
  if (token.error_description) {
    throw new Error(token.error_description);
  }
  return token.access_token;
};

const setup = async () => {
  const bearer = await credentials({
    server: KEYCLOAK_SERVER,
    user: KEYCLOAK_ADMIN,
    password: KEYCLOAK_ADMIN_PASSWORD,
  });
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${bearer}`,
  };
  // Create realm
  console.info(`Creating realm '${KEYCLOAK_REALM}'`);
  let response = await fetch(`${KEYCLOAK_SERVER}/admin/realms`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      enabled: true,
      realm: KEYCLOAK_REALM,
      registrationAllowed: true,
    }),
  });
  let json = null;
  if (response.status !== 201) {
    json = await response.json();
    console.error(
      `Failed to create realm '${KEYCLOAK_REALM}': ${json.errorMessage}`
    );
  } else {
    console.info(`Created realm '${KEYCLOAK_REALM}'`);
  }
  // Create identity provider
  console.info(`Creating identity provider '${KEYCLOAK_IDENTITY_PROVIDER}'`);
  response = await fetch(
    `${KEYCLOAK_SERVER}/admin/realms/${KEYCLOAK_REALM}/identity-provider/instances`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        alias: KEYCLOAK_IDENTITY_PROVIDER,
        config: {
          authorizationUrl: 'http://localhost:9000/oauth2/authorize',
          clientAssertionAudience: '',
          clientAssertionSigningAlg: '',
          clientAuthMethod: 'private_key_jwt',
          clientId: 'keycloak-client',
          clientSecret: '',
          guiOrder: '',
          issuer: 'http://localhost:9000',
          jwksUrl: 'http://localhost:9000/oauth2/jwks',
          jwtX509HeadersEnabled: 'false',
          logoutUrl: 'http://localhost:9000/connect/logout',
          metadataDescriptorUrl:
            'http://localhost:9000/.well-known/openid-configuration',
          pkceEnabled: 'false',
          tokenUrl: 'http://localhost:9000/oauth2/token',
          useJwksUrl: 'true',
          userInfoUrl: 'http://localhost:9000/userinfo',
          validateSignature: 'true',
        },
        displayName: KEYCLOAK_IDENTITY_PROVIDER_NAME,
        providerId: 'oidc',
      }),
    }
  );
  if (response.status !== 201) {
    json = await response.json();
    console.error(
      `Failed to create identity provider '${KEYCLOAK_IDENTITY_PROVIDER}': ${json.errorMessage}`
    );
  } else {
    console.info(`Created identity provider '${KEYCLOAK_IDENTITY_PROVIDER}'`);
  }
  // Create mappers
  console.info(
    `Creating 'email' mapper for identity provider '${KEYCLOAK_IDENTITY_PROVIDER}'`
  );
  response = await fetch(
    `${KEYCLOAK_SERVER}/admin/realms/${KEYCLOAK_REALM}/identity-provider/instances/${KEYCLOAK_IDENTITY_PROVIDER}/mappers`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        config: {
          claim: 'email',
          syncMode: 'INHERIT',
          'user.attribute': 'email',
        },
        identityProviderAlias: KEYCLOAK_IDENTITY_PROVIDER,
        identityProviderMapper: 'oidc-user-attribute-idp-mapper',
        name: 'email',
      }),
    }
  );
  if (response.status !== 201) {
    json = await response.json();
    console.error(
      `Failed to create 'email' mapper for identity provider '${KEYCLOAK_IDENTITY_PROVIDER}': ${json.errorMessage}`
    );
  } else {
    console.info(
      `Created 'email' mapper for identity provider '${KEYCLOAK_IDENTITY_PROVIDER}'`
    );
  }

  console.info(
    `Creating 'given_name' mapper for identity provider '${KEYCLOAK_IDENTITY_PROVIDER}'`
  );
  response = await fetch(
    `${KEYCLOAK_SERVER}/admin/realms/${KEYCLOAK_REALM}/identity-provider/instances/${KEYCLOAK_IDENTITY_PROVIDER}/mappers`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        config: {
          claim: 'given_name',
          syncMode: 'INHERIT',
          'user.attribute': 'firstName',
        },
        identityProviderAlias: KEYCLOAK_IDENTITY_PROVIDER,
        identityProviderMapper: 'oidc-user-attribute-idp-mapper',
        name: 'given_name',
      }),
    }
  );
  if (response.status !== 201) {
    json = await response.json();
    console.error(
      `Failed to create 'given_name' mapper for identity provider '${KEYCLOAK_IDENTITY_PROVIDER}': ${json.errorMessage}`
    );
  } else {
    console.info(
      `Created 'given_name' mapper for identity provider '${KEYCLOAK_IDENTITY_PROVIDER}'`
    );
  }

  console.info(
    `Creating 'family_name' mapper for identity provider '${KEYCLOAK_IDENTITY_PROVIDER}'`
  );
  response = await fetch(
    `${KEYCLOAK_SERVER}/admin/realms/${KEYCLOAK_REALM}/identity-provider/instances/${KEYCLOAK_IDENTITY_PROVIDER}/mappers`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        config: {
          claim: 'family_name',
          syncMode: 'INHERIT',
          'user.attribute': 'lastName',
        },
        identityProviderAlias: KEYCLOAK_IDENTITY_PROVIDER,
        identityProviderMapper: 'oidc-user-attribute-idp-mapper',
        name: 'family_name',
      }),
    }
  );
  if (response.status !== 201) {
    json = await response.json();
    console.error(
      `Failed to create 'family_name' mapper for identity provider '${KEYCLOAK_IDENTITY_PROVIDER}': ${json.errorMessage}`
    );
  } else {
    console.info(
      `Created 'family_name' mapper for identity provider '${KEYCLOAK_IDENTITY_PROVIDER}'`
    );
  }
};

setup()
  .catch((err) => console.error(err.message ?? err))
  .finally(() => console.info('Setup complete'));
