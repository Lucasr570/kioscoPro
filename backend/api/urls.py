from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import SupplierViewSet, ClientViewSet, ProductViewSet, SaleViewSet, ExpenseViewSet

router = DefaultRouter()
router.register(r'suppliers', SupplierViewSet)
router.register(r'clients', ClientViewSet)
router.register(r'products', ProductViewSet)
router.register(r'sales', SaleViewSet)
router.register(r'expenses', ExpenseViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
