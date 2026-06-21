from django.db import migrations
from django.utils import timezone  # <--- IMPORTAMOS ESTO

def crear_usuario_inicial(apps, schema_editor):
    # Obtenemos el modelo de usuario actual del proyecto
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    # Evitamos duplicados: si el usuario no existe, lo creamos
    if not User.objects.filter(username='lucas').exists():
        User.objects.create_superuser(
            username='lucas',
            email='lucasr57@gmail.com',
            password='Contrakiosco!',
            last_login=timezone.now()  # <--- AGREGAMOS ESTA LÍNEA
        )

def eliminar_usuario_inicial(apps, schema_editor):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    User.objects.filter(username='lucas').delete()

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_remove_supplier_organizacion_and_more'), 
    ]

    operations = [
        migrations.RunPython(crear_usuario_inicial, eliminar_usuario_inicial),
    ]