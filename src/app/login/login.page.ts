import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { MessagesService } from '../services/messages.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  public email: string;
  public password: string;

  constructor(
    private authService: AuthService,
    private messagesService: MessagesService,
    private myRouter: Router,
  ) {
    this.email = '';
    this.password = '';
  }

  ngOnInit() {
    this.authService.isLoggednIn();
  }

  login() {
    this.authService.login(this.email, this.password)
      .then(user => this.myRouter.navigate(['/home']))
      .catch(err => this.handleErrors(err.code))
  }

  private handleErrors(errorCode) {
    let msg = '';
    if (errorCode == 'auth/wrong-password') msg = 'Password incorrecto';
    else if (errorCode == 'auth/user-not-found') msg = 'Usuario incorrecto';
    else msg = 'Ha ocurrido un error. Verifique los datos ingresados';

    this.messagesService.showToast({ msg });
  }
}
