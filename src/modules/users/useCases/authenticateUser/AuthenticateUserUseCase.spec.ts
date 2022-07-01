import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe('Authenticate user', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it('should be able to authenticate an user', async () => {
    await createUserUseCase.execute({
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: 'johndoe123'
    });

    const auth = await authenticateUserUseCase.execute({
      email: 'johndoe@email.com',
      password: 'johndoe123'
    });

    expect(auth.user.email).toBe('johndoe@email.com');
    expect(auth).toHaveProperty('token');
  });

  it('should not be able to authenticate an user with an incorrect email', async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: 'John Doe',
        email: 'johndoe@email.com',
        password: 'johndoe123'
      });

      await authenticateUserUseCase.execute({
        email: 'incorrect@email.com',
        password: 'johndoe123'
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it('should not be able to authenticate an user with an incorrect password', async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: 'John Doe',
        email: 'johndoe@email.com',
        password: 'johndoe123'
      });

      await authenticateUserUseCase.execute({
        email: 'johndoe@email.com',
        password: 'incorrect'
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
