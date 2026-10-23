package org.acme.security.openid.connect;

import io.quarkus.security.identity.SecurityIdentity;

public class User {
    private final String userName;

    User(SecurityIdentity securityIdentity) {
        this.userName = securityIdentity.getPrincipal().getName();
    }

    public String getUserName() {
        return userName;
    }
}
