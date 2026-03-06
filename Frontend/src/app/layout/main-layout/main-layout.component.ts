import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="layout-wrapper">
      <app-sidebar></app-sidebar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      display: flex;
      flex-direction: column;
      margin-top: 64px;
    }
    .main-content {
      margin-left: 240px;
      flex: 1;
      min-height: calc(100vh - 64px - 60px);
      padding: 24px;
      background: #f0f2f5;
      padding-bottom: 80px;
    }
  `]
})
export class MainLayoutComponent {}
