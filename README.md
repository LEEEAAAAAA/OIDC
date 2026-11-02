Following: https://quarkus.io/guides/security-oidc-bearer-token-authentication-tutorial/
           https://github.com/mauriciovigolo/keycloak-angular?tab=readme-ov-file

    Note: We have 2 Endpoints, admin and user.
            - We only have a user obj bc we return user info (the name), at the admin endpoint you only return a str


run the container ( with the realm file from resources):docker run --name keycloak -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin -p 8180:8080 quay.io/keycloak/keycloak:26.7.4 start-dev
or docker start keycloak

 java -jar target/quarkus-app/quarkus-run.jar

test:
Get tokens as alice
export access_token=$(curl -s -X POST \
  http://localhost:8180/realms/quarkus/protocol/openid-connect/token \
  --user backend-service:secret \
  -d 'username=alice&password=alice&grant_type=password' | jq -r .access_wtoken)

  try and login:
  curl -i http://localhost:8080/api/users/me -H "Authorization: Bearer $access_token"

  or get username:
  curl -i http://localhost:8080/api/users/me -H "Authorization: Bearer $access_token"


After implementing the FE (Angular SPA with keycloak-angular):

run:
    1. docker stop keycloak            (Dev Services needs port 8180)
    2. in security-openid-connect-quickstart: ./mvnw quarkus:dev
       -> Dev Services starts Keycloak on 8180 and loads quarkus-realm.json
    3. in frontend: ng serve
    4. open http://localhost:4200

test:
    - Login as alice/alice -> Call BE -> "BE says: alice"
    - Login as admin/admin -> Call BE -> Error 403 (/api/users/me only allows role "user")

The story, alice logs in:
    1.  App starts (main.ts). provideKeycloak does a silent check-sso:
        invisible iframe asks Keycloak "anyone logged in?" -> no.
        silent-check-sso.html passes the answer back to the app.
    2.  loggedIn = false -> page shows the Login button.
    3.  Click Login -> keycloak.login() -> browser goes to Keycloak (8180) with client_id=frontend + PKCE code_challenge.
    4.  alice/alice -> Keycloak checks its users (realm file) -> back to localhost:4200/#code=...
        (one-time code, not the token yet)
    5.  App starts again, keycloak-js trades the code for the token.
        loggedIn = true, username = tokenParsed.preferred_username, roles = realmAccess.roles
    6.  Click Call BE -> http.get('http://localhost:8080/api/users/me')
    7.  Interceptor: URL starts with localhost:8080 (backendCondition) -> adds "Authorization: Bearer <token>"
    8.  CORS: quarkus.http.cors.origins=http://localhost:4200 lets the request in
    9.  quarkus-oidc checks the token (signed by Keycloak, not expired) -> SecurityIdentity (alice, role user)
    10. @RolesAllowed("user") passes -> me() returns {"userName":"alice"}
    11. Angular shows "BE says: alice"
    12. Background: withAutoRefreshToken renews the token, 1 min inactivity -> logout

    start -> silent check -> Login -> Keycloak -> #code -> token
          -> Call BE -> interceptor -> CORS -> token check -> @RolesAllowed -> "alice"

Who does what:
    Get the token     -> Keycloak (at login)
    Attach the token  -> interceptor + backendCondition (every request to 8080)
    Check the token   -> Quarkus quarkus-oidc (when the request arrives)
