from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SupplierViewSet, ClientViewSet, ProductViewSet, SaleViewSet, ExpenseViewSet

router = DefaultRouter()
router.register(r'suppliers', SupplierViewSet)
router.register(r'clients', ClientViewSet)
router.register(r'products', ProductViewSet)
router.register(r'sales', SaleViewSet)
router.register(r'expenses', ExpenseViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
