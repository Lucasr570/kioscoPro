from django.test import TestCase
from api.models import Supplier, Client, Product

class ModelTests(TestCase):
    def test_supplier_str(self):
        supplier = Supplier.objects.create(name="Proveedor X")
        self.assertEqual(str(supplier), "Proveedor X")

    def test_client_defaults(self):
        client = Client.objects.create(name="Juan")
        self.assertEqual(client.debt, 0.00)

    def test_product_str(self):
        product = Product.objects.create(
            barcode="AAA", 
            name="Gaseosa", 
            price=100, 
            cost=50, 
            category="Bebidas"
        )
        self.assertEqual(str(product), "Gaseosa")
