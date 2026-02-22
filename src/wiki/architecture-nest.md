---
title: Wiki - Architecture NestJS avec Rust
---

Pour construire une API en Rust (avec [Axum](https://docs.rs/axum)) selon les **principes de NestJS** (controller, service, module, etc.), il est recommandé d'adopter une architecture modulaire et découplée :

- **Module** : Un module regroupe un ensemble cohérent de fonctionnalités (ex : gestion des dialogues, utilisateurs, sauvegardes). Chaque module contient ses propres contrôleurs, services et modèles.
- **Controller** : Le contrôleur gère les routes HTTP et reçoit les requêtes de l'utilisateur. Il délègue la logique métier aux services. Chaque handler correspond à une méthode du contrôleur.
- **Service** : Le service contient la logique métier et interagit avec la base de données ou d'autres services. Il est injecté dans le contrôleur.
- **Model** : Les modèles représentent les entités manipulées (structs Rust) et servent à la sérialisation/désérialisation (Serde).
- **Injection de dépendances** : Utiliser des crates comme [Shaku](https://docs.rs/shaku) ou des patterns Rust pour injecter les services dans les contrôleurs.

```
src/
├── main.rs
└── modules/
    └── dialogues/
        ├── mod.rs
        ├── controller.rs
        ├── service.rs
        └── model.rs
```

Cette approche permet de garder une architecture claire, testable et évolutive, similaire à celle de NestJS, mais adaptée à l'écosystème Rust.
