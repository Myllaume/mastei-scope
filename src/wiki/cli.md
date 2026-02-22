---
title: Wiki - CLI
---

## Objet

On souhaite afficher des dialogues en fonction du point de sauvegarde dans une partie de l'utilisateur. On reprendra les principales mécaniques du [[the council | jeu The Council]].

## Architecture

On utilisera le langage **Rust**.

- API : une **API** (REST CRUDS) administre une **base MongoBD**.
- CLI : le CLI interroge l'API pour répondre aux commandes de l'utilisateur.

Architecture [[architecture nest | NestJS avec Rust]].

## Techniques

- Docker
- Rust
- MongoDB
