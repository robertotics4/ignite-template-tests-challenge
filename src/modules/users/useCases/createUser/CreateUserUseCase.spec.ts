import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserError } from './CreateUserError';
import { CreateUserUseCase } from './CreateUserUseCase';

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Create user', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it('should be able to create a new user', async () => {
    const user = await createUserUseCase.execute({
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: 'test-password'
    });

    expect(user).toHaveProperty('id');
    expect(user.email).toBe('johndoe@email.com');
  })

  it('should not be able to create a new user with the same e-mail', async () => {
    expect(async() => {
      await createUserUseCase.execute({
        name: 'John Doe',
        email: 'johndoe@email.com',
        password: 'test-password'
      });

      await createUserUseCase.execute({
        name: 'Doe John',
        email: 'johndoe@email.com',
        password: 'test-password'
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
