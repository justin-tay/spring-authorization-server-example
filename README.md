# Spring Boot Authorization Server Example

This project is an example implementation of a OAuth2 Authorization Server.

[Keycloak](https://github.com/keycloak/keycloak) is used as the Relying Party for testing purposes

## Quick Start

### Installing and running the Spring Boot Authorization Server application

```shell
mvn spring-boot:run
```

### Configuring Keycloak as the Relying Party to Broker to Spring Authorization Server

Start Keycloak

```shell
kc start-dev
```

Access Keycloak at http://localhost:8080/

* Create an administrative user
* Login to the administrative console
* Create the `test` realm
  * Click on the `Keycloak` dropdown on the left navigation bar
  * Select `Create Realm`
  * Set `test` as the `Realm name` and click on `Create`
* Create the `spring-authorization-server` Identity provider
  * Click on `Identity providers` on the left navigation bar
  * Click on `OpenID Connect v1.0`
  * Set `spring-authorization-server` as the `Alias`
  * Set `Spring Authorization Server` as the `Display name`
  * Set `http://localhost:9000/.well-known/openid-configuration` as the `Discovery endpoint`
  * Select `JWT signed with private key` as the `Client authentication`
  * Set `keycloak-client` as the `Client ID`
  * Click on `Add`
* Configure the Mappers for Spring Authorization Server
  * Click on `Mappers`
  * Add `email` mapper
    * Click on `Add mapper`
    * Set `email` as `Name`
    * Select `Attribute Importer` as `Mapper type`
    * Set `email` as `Claim`
    * Select `email` as `User Attribute Name`
  * Add `given_name` mapper
    * Click on `Add mapper`
    * Set `given_name` as `Name`
    * Select `Attribute Importer` as `Mapper type`
    * Set `given_name` as `Claim`
    * Select `firstName` as `User Attribute Name`
  * Add `family_name` mapper
    * Click on `Add mapper`
    * Set `family_name` as `Name`
    * Select `Attribute Importer` as `Mapper type`
    * Set `family_name` as `Claim`
    * Select `lastName` as `User Attribute Name`

### Testing the example Authorization Server

Access the Keycloak user account page at http://localhost:8080/realms/test/account/
* Click on `Spring Authorization Server` to login to the Spring Boot Authorization Server 
* Login using username `user1` and password `password`

View the public keys at http://localhost:9000/oauth2/jwks

View the OpenID Configuration at http://localhost:9000/.well-known/openid-configuration

## Integration Details

Note that this example does not securely store the private keys which are located in `src/main/resources/jwks.json`. This should be securely stored and rotated, for instance on AWS this should be stored in AWS Secrets Manager with a Secrets Manager Rotation Lambda. This can be configured in Spring using [Spring Cloud AWS Secrets Manager](https://github.com/awspring/spring-cloud-aws).

## Flow

```mermaid
sequenceDiagram
    autonumber

    participant User
    participant Browser
    participant Keycloak
    participant Authorization Server

    User->>Browser: Navigate to user account page

    Browser->>Keycloak: Send request for user account page (/realms/test/account)

    Keycloak->>Keycloak: Not authenticated. Generate Authorization Request

    Keycloak-->>Browser: Redirect to Keycloak with Authorization Request

    Browser->>Keycloak: Send Authorization Request (/realms/test/protocol/openid-connect/auth)

    Keycloak->>Keycloak: Generate login page

    Keycloak-->>Browser: Return login page

    User->>Browser: Select Spring Authorization Server

    Browser->>Keycloak: Send request for Spring Authorization Server (/realms/test/broker/spring-authorization-server/login)

    Keycloak-->>Browser: Redirect to Spring Authorization Server

    Browser->>Authorization Server: Send Authorization Request (/oauth2/authorize)

    Authorization Server-->>Browser: Redirect to login page

    Browser->>Authorization Server: Send request for login page (/login)

    Authorization Server->>Authorization Server: Generate login page

    Authorization Server-->>Browser: Return login page

    User->>Browser: Enter login credentials

    Browser->>Authorization Server: Send login credentials 

    Authorization Server->>Authorization Server: Process login credentials

    Authorization Server-->>Browser: Redirect to Authorization Server

    Browser->>Authorization Server: Send Authorization Request (/oauth2/authorize)

    Authorization Server-->>Browser: Redirect to Keycloak with Authorization Response with code

    Browser->>Keycloak: Send Authorization Response with code (/realms/test/broker/spring-authorization-server/endpoint)

    Keycloak->>Keycloak: Generate Token Request and client credentials

    Keycloak->>Authorization Server: Send Token Request with client credentials (/oauth2/token)

    Authorization Server->>Keycloak: Send request for client json web key set (/realms/test/protocol/openid-connect/certs)

    Keycloak-->>Authorization Server: Return client json web key set

    Authorization Server->>Authorization Server: Process client credentials and create tokens

    Authorization Server-->>Keycloak: Return Token Response with access, refresh and id tokens

    Keycloak->>Keycloak: Process first broker login flow if new user

    Keycloak-->>Browser: Redirect to user account page

    Browser->>Keycloak: Send request for user account page (/account)

    Keycloak-->>Browser: Return user information page
```