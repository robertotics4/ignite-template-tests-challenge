import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType, Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let user: User;
let statement: Statement;

describe('Get statement operation', () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);

    user = await createUserUseCase.execute({
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: 'johndoe123'
    });

    statement = await createStatementUseCase.execute({
      user_id: String(user.id),
      type: OperationType.DEPOSIT,
      amount: 30,
      description: 'test deposit'
    });
  });

  it('should be able to get a statement operation', async () => {
    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: String(user.id),
      statement_id: String(statement.id)
    });

    expect(statementOperation.id).toBe(statement.id);
    expect(statementOperation.type).toBe(OperationType.DEPOSIT);
    expect(statementOperation.amount).toBe(statement.amount)
  });

  it('should not be able to get a statement operation with invalid user_id', async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: 'invalid_user_id',
        statement_id: String(statement.id)
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it('should not be able to get a statement operation with invalid statement_id', async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: String(user.id),
        statement_id: 'invalid_statement_id'
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
