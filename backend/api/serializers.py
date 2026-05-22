from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Supplier, Client, Product, Sale, SaleItem, Expense

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ('user',)

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'
        read_only_fields = ('user',)

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ('user',)

class ProductSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)

    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ('user',)

class SaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    cost = serializers.DecimalField(source='product.cost', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = SaleItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price_at_sale', 'cost']

class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True)
    
    class Meta:
        model = Sale
        fields = ['id', 'date', 'total', 'paymentMethod', 'client', 'items']
        read_only_fields = ('user',)

    def validate(self, data):
        payment_method = data.get('paymentMethod')
        client = data.get('client')
        total = data.get('total')
        
        if payment_method == 'abono':
            if not client:
                raise serializers.ValidationError("Debe seleccionar un cliente para realizar un abono.")
            if total > client.debt:
                raise serializers.ValidationError(f"El abono (${total}) no puede ser mayor a la deuda actual (${client.debt}).")
        
        if payment_method == 'cuenta' and not client:
            raise serializers.ValidationError("Debe seleccionar un cliente para ventas a cuenta.")
            
        return data

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        sale = Sale.objects.create(**validated_data)
        
        # Procesar los items, descontar stock y acumular costo
        for item_data in items_data:
            product = item_data['product']
            quantity = item_data['quantity']
            
            # Crear el item de venta
            SaleItem.objects.create(sale=sale, **item_data)
            
            # Descontar stock
            if product:
                product.stock -= quantity
                product.save()

        # Actualizar deuda del cliente si es a cuenta o abono
        if sale.paymentMethod == 'cuenta' and sale.client:
            sale.client.debt += sale.total
            sale.client.save()
        elif sale.paymentMethod == 'abono' and sale.client:
            sale.client.debt -= sale.total
            if sale.client.debt < 0:
                sale.client.debt = 0
            sale.client.save()

        return sale
