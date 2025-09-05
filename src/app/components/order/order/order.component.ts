import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DataService } from '../../../services/data';
import { CommonModule } from '@angular/common';

export interface MenuItem {
  id: number;
  category: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface CategoryItem {
  id: number;
  name: string;
  description: string;
  items: MenuItem[];
}

export interface OrderItem {
  item: MenuItem;
  quantity: number;
}

@Component({
  selector: 'app-order',
  imports: [CommonModule],
  templateUrl: './order.html',
  styleUrl: './order.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderComponent {
  private dataService = inject(DataService);

  menu = signal<CategoryItem[]>([]);
  order = signal<OrderItem[]>([]);

  total = computed(() => {
    return this.order().reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);
  });

  ngOnInit() {
      this.dataService.getMenu().subscribe(data => {
        this.menu.set(data);
      });
    }

  addToOrder(item: MenuItem) {
    const existingItem = this.order().find(orderItem => orderItem.item.name === item.name);
    if (existingItem) {
      existingItem.quantity++;
      this.order.set([...this.order()]);
    } else {
      this.order.set([...this.order(), { item, quantity: 1 }]);
    }
  }

  removeFromOrder(item: MenuItem) {
    const existingItem = this.order().find(orderItem => orderItem.item.name === item.name);
    if (existingItem) {
      existingItem.quantity--;
      if (existingItem.quantity === 0) {
        this.order.set(this.order().filter(orderItem => orderItem.item.name !== item.name));
      } else {
        this.order.set([...this.order()]);
      }
    }
  }
}
