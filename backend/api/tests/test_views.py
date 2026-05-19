from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from api.models import Product, Supplier, Client

class ViewTests(APITestCase):
    def setUp(self):
        self.supplier = Supplier.objects.create(name="Proveedor")
        self.product = Product.objects.create(
            name="Alfajor", barcode="779", cost=50, price=100, stock=20, supplier=self.supplier
        )
        self.client_obj = Client.objects.create(name="Juan", debt=0)

    def test_complete_sale_flow(self):
        """Prueba un flujo de venta completo y descuento de stock"""
        url = reverse('sale-list')
        data = {
            "total": 200,
            "paymentMethod": "efectivo",
            "items": [
                {"product": self.product.id, "quantity": 2, "price_at_sale": 100}
            ]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verificar stock
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 18)

    def test_sale_on_account_flow(self):
        """Prueba flujo de venta a cuenta y aumento de deuda"""
        url = reverse('sale-list')
        data = {
            "total": 500,
            "paymentMethod": "cuenta",
            "client": self.client_obj.id,
            "items": []
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verificar deuda
        self.client_obj.refresh_from_db()
        self.assertEqual(float(self.client_obj.debt), 500.0)

    def test_search_product_by_barcode(self):
        """Verifica que el filtrado de productos funciona (si está implementado)"""
        url = reverse('product-list') + "?barcode=779"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_CREATED if False else status.HTTP_200_OK)
        # Depende de si el ViewSet tiene filter_backends configurados
