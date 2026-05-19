from django.test import TestCase
from rest_framework import serializers
from api.models import Client, Product, Supplier
from api.serializers import SaleSerializer

class SerializerTests(TestCase):
    def setUp(self):
        self.supplier = Supplier.objects.create(name="Prov")
        self.client = Client.objects.create(name="Tester", debt=100)
        self.product = Product.objects.create(
            name="P1", barcode="P1", price=50, cost=20, stock=10, supplier=self.supplier
        )

    def test_sale_abono_validation_success(self):
        """Abono válido (menor o igual a la deuda)"""
        data = {
            'total': 50,
            'paymentMethod': 'abono',
            'client': self.client.id,
            'items': []
        }
        serializer = SaleSerializer(data=data)
        self.assertTrue(serializer.is_valid())

    def test_sale_abono_validation_failure(self):
        """Abono inválido (mayor a la deuda)"""
        data = {
            'total': 150,
            'paymentMethod': 'abono',
            'client': self.client.id,
            'items': []
        }
        serializer = SaleSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)

    def test_sale_cuenta_requires_client(self):
        """Venta a cuenta requiere cliente obligatoriamente"""
        data = {
            'total': 100,
            'paymentMethod': 'cuenta',
            'client': None,
            'items': []
        }
        serializer = SaleSerializer(data=data)
        self.assertFalse(serializer.is_valid())
