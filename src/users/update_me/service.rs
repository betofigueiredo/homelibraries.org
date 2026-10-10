use std::sync::Arc;

use crate::{
    error::AppError,
    users::{model::User, repository::UserRepository},
};

pub struct UpdateMeInput {
    pub username: Option<String>,
    /// `None`: leave it. `Some(None)`: remove it. The two levels mirror a PATCH body, where a
    /// missing field and an empty one mean different things.
    #[allow(clippy::option_option)]
    pub display_name: Option<Option<String>>,
}

pub struct UpdateMeService {
    users: Arc<dyn UserRepository>,
}

impl UpdateMeService {
    pub fn new(users: Arc<dyn UserRepository>) -> Self {
        Self { users }
    }

    /// `Conflict` if another user has the username.
    /// Changing it moves the library and its MCP address.
    pub async fn execute(&self, mut user: User, input: UpdateMeInput) -> Result<User, AppError> {
        if let Some(username) = input.username {
            let owner = self.users.find_by_username(&username).await?;
            if owner.is_some_and(|owner| owner.id != user.id) {
                return Err(AppError::Conflict(format!("`{username}` is taken")));
            }
            user.username = Some(username);
        }
        if let Some(display_name) = input.display_name {
            user.display_name = display_name;
        }
        self.users.update(&user).await?;
        Ok(user)
    }
}

#[cfg(test)]
mod tests {
    use chrono::Utc;

    use super::*;
    use crate::users::{model::UserId, repository::InMemoryUserRepository};

    async fn user(users: &InMemoryUserRepository, email: &str) -> User {
        let user = User {
            id: UserId::new(),
            email: email.into(),
            username: None,
            display_name: None,
            created_at: Utc::now(),
        };
        users.insert(&user).await.unwrap();
        user
    }

    fn username(name: &str) -> UpdateMeInput {
        UpdateMeInput {
            username: Some(name.into()),
            display_name: None,
        }
    }

    #[tokio::test]
    async fn usernames_are_unique_but_keeping_yours_is_fine() {
        let users = Arc::new(InMemoryUserRepository::default());
        let ada = user(&users, "ada@mail.com").await;
        let grace = user(&users, "grace@mail.com").await;
        let service = UpdateMeService::new(users.clone());

        let ada = service.execute(ada, username("ada")).await.unwrap();
        assert!(service.execute(ada.clone(), username("ada")).await.is_ok());
        assert!(matches!(
            service.execute(grace, username("ada")).await,
            Err(AppError::Conflict(_))
        ));
    }

    #[tokio::test]
    async fn display_name_can_be_removed() {
        let users = Arc::new(InMemoryUserRepository::default());
        let ada = user(&users, "ada@mail.com").await;
        let service = UpdateMeService::new(users.clone());
        let set = |name: Option<&str>| UpdateMeInput {
            username: None,
            display_name: Some(name.map(str::to_owned)),
        };

        let ada = service.execute(ada, set(Some("Ada"))).await.unwrap();
        assert_eq!(ada.display_name.as_deref(), Some("Ada"));
        let ada = service.execute(ada, set(None)).await.unwrap();
        assert_eq!(users.get(ada.id).await.unwrap().unwrap().display_name, None);
    }
}
