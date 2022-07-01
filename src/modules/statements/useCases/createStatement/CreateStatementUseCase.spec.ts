import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let user: User;

describe('Create statement', () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);

    user = await createUserUseCase.execute({
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: 'test-password'
    });
  });

  it('should be able to create a new statement', async () => {
    const statementOperation = await createStatementUseCase.execute({
      user_id: String(user.id),
      type: OperationType.DEPOSIT,
      amount: 50,
      description: 'test deposit'
    });

    expect(statementOperation).toHaveProperty('id');
    expect(statementOperation.amount).toBe(50);
  });

  it('should not be able to create a new statement without an user_id', async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: 'inexistentId',
        type: OperationType.DEPOSIT,
        amount: 30,
        description: 'test deposit'
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it('should not be able to create a new withdraw with amount greater than the balance', async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: String(user.id),
        type: OperationType.DEPOSIT,
        amount: 50,
        description: 'test deposit'
      });

      await createStatementUseCase.execute({
        user_id: String(user.id),
        type: OperationType.WITHDRAW,
        amount: 100,
        description: 'test withdraw'
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
