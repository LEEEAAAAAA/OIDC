import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private keycloak = inject(Keycloak);
  private http = inject(HttpClient);

  loggedIn = this.keycloak.authenticated ?? false;
  username = this.keycloak.tokenParsed?.['preferred_username'];
  roles = this.keycloak.realmAccess?.roles ?? [];

  backendAnswer = '';

  login() {
    this.keycloak.login();
  }

  logout() {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }

  callBackend() {
    this.http.get<{ userName: string }>('http://localhost:8080/api/users/me').subscribe({
      next: (user) => (this.backendAnswer = 'BE says: ' + user.userName),
      error: (err) => (this.backendAnswer = 'Error ' + err.status + ': ' + err.statusText)
    });
  }
}
