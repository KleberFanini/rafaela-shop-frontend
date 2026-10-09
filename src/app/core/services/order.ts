import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardStats, Order } from '../../shared/models/ecommerce.models';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/orders`;

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard-stats`);
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  createOrder(orderData: any): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, orderData);
  }

  updateOrderStatus(orderId: number, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${orderId}/status?status=${status}`, {});
  }
}
