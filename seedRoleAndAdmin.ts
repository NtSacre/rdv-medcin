import { NestFactory } from '@nestjs/core';

import * as bcrypt from 'bcrypt';
import { AppModule } from 'src/app.module';
import { RolesService } from 'src/roles/roles.service';
import { UsersService } from 'src/users/users.service';

async function bootstrap() {
  // Crée le contexte de l'application Nest sans lancer le serveur HTTP
  const appContext = await NestFactory.createApplicationContext(AppModule);

  // Récupère les services nécessaires
  const roleService = appContext.get(RolesService);
  const userService = appContext.get(UsersService);

  // Tableau des rôles à insérer
  const rolesData = [
    { libelle: 'admin' },
    { libelle: 'medecin' },
    { libelle: 'patient' },
  ];

  // Insère chaque rôle si inexistant
  for (const roleData of rolesData) {
    const existingRole = await roleService.findByLibelle(roleData.libelle);
    if (!existingRole) {
      await roleService.createRole(roleData);
      console.log(`Role '${roleData.libelle}' créé.`);
    } else {
      console.log(`Role '${roleData.libelle}' existe déjà.`);
    }
  }

  // Exemple de création d'un utilisateur admin
  const adminEmail = 'admin@exemple.com';
  const existingAdmin = await userService.findByEmail(adminEmail);
  if (!existingAdmin) {
    // Récupère le rôle admin (on suppose qu'il a été créé et qu'il est le premier, id = 1)
   // const adminRole = await roleService.findByLibelle('admin');
    const hashedPassword = await bcrypt.hash('adminPassword', 10);
    const adminUser = await userService.createUser({"email" : adminEmail, "nom" :'Admin', "password": hashedPassword, "roleId": 1});
    console.log(`Utilisateur admin créé : ${adminUser.email}`);
  } else {
    console.log(`Utilisateur admin (${adminEmail}) existe déjà.`);
  }

  await appContext.close();
}

bootstrap();
