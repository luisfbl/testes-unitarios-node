import request from 'supertest';
import { App } from '../../../src/app';
import { IUser } from '../../../src/interfaces/IUser';
import { IUserResponse } from '../../../src/interfaces/IUserResponse';
import { UserRepository } from '../../../src/endpoints/users/userRepository';

// Cria uma instância da aplicação para executar os testes
const app = new App().server.listen(8081);

describe('UserController', () => {
  afterAll((done) => {
    // Fechar o servidor após os testes
    app.close(done);
  });

  describe('GET /users - Listagem de usuários', () => {
    it('Deve retornar uma lista vazia quando não houver usuários cadastrados', async () => {
      jest.spyOn(UserRepository.prototype, 'list').mockReturnValueOnce([]);

      const response = await request(app).get('/users');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('Deve retornar todos os usuários com a propriedade isOfAge calculada corretamente', async () => {
      const mockUsers: IUser[] = [
        { id: 1, name: 'Alice Silva', age: 25 },
        { id: 2, name: 'Bruno Costa', age: 17 },
        { id: 3, name: 'Carlos Oliveira', age: 30 },
      ];

      const expectedResponse: IUserResponse[] = [
        { id: 1, name: 'Alice Silva', age: 25, isOfAge: true },
        { id: 2, name: 'Bruno Costa', age: 17, isOfAge: false },
        { id: 3, name: 'Carlos Oliveira', age: 30, isOfAge: true },
      ];

      jest.spyOn(UserRepository.prototype, 'list').mockReturnValueOnce(mockUsers);

      const response = await request(app).get('/users');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expectedResponse);
    });
  });

  describe('GET /users/:id - Informações do usuário', () => {
    it('Deve retornar um usuário maior de idade com sucesso', async () => {
      const mockUser: IUser = { id: 100, name: 'Helena Martins', age: 45 };
      const expectedResponse: IUserResponse = { ...mockUser, isOfAge: true };

      jest.spyOn(UserRepository.prototype, 'findOne').mockReturnValueOnce(mockUser);

      const response = await request(app).get('/users/100');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expectedResponse);
    });

    it('Deve retornar erro 404 quando o usuário não for encontrado', async () => {
      jest.spyOn(UserRepository.prototype, 'findOne').mockReturnValueOnce(undefined);

      const response = await request(app).get('/users/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toBe('Usuário não encontrado');
    });
  });

  describe('POST /users - Criação de usuário', () => {
    it('Deve criar um novo usuário com sucesso', async () => {
      const newUser: IUser = { id: 500, name: 'Laura Fernandes', age: 28 };

      jest.spyOn(UserRepository.prototype, 'save').mockReturnValueOnce(true);

      const response = await request(app).post('/users').send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBe('Usuário criado com sucesso');
    });

    it('Deve retornar erro 500 quando o ID do usuário já existe', async () => {
      const duplicateUser: IUser = { id: 800, name: 'Oscar Dutra', age: 35 };

      jest.spyOn(UserRepository.prototype, 'save').mockReturnValueOnce(false);

      const response = await request(app).post('/users').send(duplicateUser);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toBe('Falha ao criar o usuário');
    });

    it('Deve retornar erro 500 quando os dados do usuário são inválidos', async () => {
      const invalidUser = { id: 900, name: 'Paula Gomes' };

      jest.spyOn(UserRepository.prototype, 'save').mockReturnValueOnce(false);

      const response = await request(app).post('/users').send(invalidUser);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /users/:id - Exclusão de usuário', () => {
    it('Deve excluir um usuário existente com sucesso', async () => {
      jest.spyOn(UserRepository.prototype, 'delete').mockReturnValueOnce(true);

      const response = await request(app).delete('/users/1300');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBe('Usuário excluído com sucesso');
    });

    it('Deve retornar erro 500 quando tentar excluir usuário inexistente', async () => {
      jest.spyOn(UserRepository.prototype, 'delete').mockReturnValueOnce(false);

      const response = await request(app).delete('/users/1400');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toBe('Falha ao remover o usuário');
    });
  });
});
