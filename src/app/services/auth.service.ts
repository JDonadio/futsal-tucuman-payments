import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import { SharingService } from './sharing.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private afAuth: AngularFireAuth,
    private myRouter: Router,
    private sharingService: SharingService,
  ) { }

  isLoggednIn() {
    let user = this.afAuth.auth.currentUser;
    let localUser = JSON.parse(localStorage.getItem('user'));
    return (user != null || localUser != null);
  }

  login(email, password): Promise<any> {
    return new Promise((resolve, reject) => {
      this.afAuth.auth.signInWithEmailAndPassword(email, password)
        .then((resp: any) => {
          localStorage.setItem('user', JSON.stringify(resp.user.email));
          this.sharingService.setUser(resp.user.email);
          resolve(resp.user.email);
        })
        .catch(err => reject(err));
    });
  }

  logout() {
    console.log('Logged Out!');
    this.myRouter.navigate(['/login']);
    this.afAuth.auth.signOut();
    localStorage.removeItem('user');
    this.sharingService.setUser(null);
    return;
  }
}
