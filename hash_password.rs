fn main() {
    use argon2::{Argon2, PasswordHasher, PasswordHash};
    use argon2::password_hash::SaltString;
    use rand_core::OsRng;

    let password = "Alayci_165";
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    
    match argon2.hash_password(password, &salt) {
        Ok(hash) => println!("{}", hash),
        Err(e) => eprintln!("Error: {}", e),
    }
}
