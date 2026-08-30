import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NoIndex } from '../../shared/no-index/no-index';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, NoIndex],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound {}
