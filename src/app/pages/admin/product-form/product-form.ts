import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import {
  LucideArrowLeft,
  LucidePlus,
  LucideTrash2,
  LucideUpload
} from '@lucide/angular';
import { ProductService } from '../../../core/services/product';
import { AuthService } from '../../../core/services/auth';
import { Category, ProductVariant } from '../../../shared/models/ecommerce.models';

@Component({
  selector: 'app-product-form',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LucideArrowLeft,
    LucidePlus,
    LucideTrash2,
    LucideUpload
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm implements OnInit {
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = signal(false);
  uploadingImage = signal(false);
  categories = signal<Category[]>([]);
  errorMessage = signal<string | null>(null);

  isEditMode = signal(false);
  productId = signal<number | null>(null);

  // Pré-visualização local (base64 ou URL do servidor)
  imagePreview = signal<string | null>(null);
  selectedFile: File | null = null;

  productData = {
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    categoryId: null as number | null
  };

  variants = signal<ProductVariant[]>([
    { size: 'M', color: 'Preto', stock: 10 }
  ]);

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (!user || user.role !== 'ADMIN') {
      this.router.navigate(['/login']);
      return;
    }

    this.loadCategories();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.isEditMode.set(true);
      this.productId.set(id);
      this.loadProductToEdit(id);
    }
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (cats) => {
        this.categories.set(cats);
        if (cats.length > 0 && !this.productData.categoryId) {
          this.productData.categoryId = cats[0].id || null;
        }
      },
      error: () => this.errorMessage.set('Não foi possível carregar as categorias.')
    });
  }

  loadProductToEdit(id: number): void {
    this.loading.set(true);
    this.productService.getProductById(id).subscribe({
      next: (prod) => {
        this.productData.name = prod.name;
        this.productData.description = prod.description;
        this.productData.price = prod.price;
        this.productData.imageUrl = prod.imageUrl || '';
        this.productData.categoryId = prod.category?.id || null;

        if (prod.imageUrl) {
          this.imagePreview.set(prod.imageUrl);
        }

        if (prod.variants && prod.variants.length > 0) {
          this.variants.set(prod.variants);
        }

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Não foi possível carregar os dados do produto.');
      }
    });
  }

  // Captura o ficheiro selecionado e gera a pré-visualização imediata
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile = file;

      // Cria a pré-visualização local enquanto não grava
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  addVariant(): void {
    this.variants.update((list) => [
      ...list,
      { size: 'P', color: 'Dourado', stock: 5 }
    ]);
  }

  removeVariant(index: number): void {
    if (this.variants().length > 1) {
      this.variants.update((list) => list.filter((_, i) => i !== index));
    }
  }

  onSubmit(): void {
    if (!this.productData.name || !this.productData.price || !this.productData.categoryId) {
      this.errorMessage.set('Preencha os campos obrigatórios do produto.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    // Se foi selecionado um ficheiro, faz o upload primeiro
    if (this.selectedFile) {
      this.uploadingImage.set(true);
      this.productService.uploadImage(this.selectedFile).subscribe({
        next: (res) => {
          this.uploadingImage.set(false);
          this.saveProduct(res.url);
        },
        error: (err) => {
          this.loading.set(false);
          this.uploadingImage.set(false);
          this.errorMessage.set('Falha no upload da imagem.');
          console.error(err);
        }
      });
    } else {
      this.saveProduct(this.productData.imageUrl || 'performance-collection.jpg');
    }
  }

  private saveProduct(imageUrl: string): void {
    const payload = {
      name: this.productData.name,
      description: this.productData.description,
      price: Number(this.productData.price),
      imageUrl: imageUrl,
      categoryId: Number(this.productData.categoryId),
      category: { id: Number(this.productData.categoryId) } as Category,
      variants: this.variants()
    };

    const request = this.isEditMode() && this.productId()
      ? this.productService.updateProduct(this.productId()!, payload)
      : this.productService.createProduct(payload);

    request.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set('Erro ao gravar o produto no servidor.');
        console.error(err);
      }
    });
  }
}
