from django.db import migrations

def crear_usuario_inicial(apps, schema_editor):
    # Obtenemos el modelo de usuario actual del proyecto
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    # Evitamos duplicados: si el usuario no existe, lo creamos
    if not User.objects.filter(username='lucas').exists():
        User.objects.create_superuser(
            username='lucas',
            email='lucasr57@gmail.com',
            password='Contrakiosco!'
        )

def eliminar_usuario_inicial(apps, schema_editor):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    User.objects.filter(username='lucas').delete()

class Migration(migrations.Migration):

    dependencies = [
        # Esto le dice a Django que corra después de tu primera migración.
        # Asegúrate de que el nombre del archivo coincida con tu migración 0001.
        ('api', '0001_initial'), 
    ]

    operations = [
        migrations.RunPython(crear_usuario_inicial, eliminar_usuario_inicial),
    ]