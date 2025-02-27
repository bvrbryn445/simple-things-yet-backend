const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt = require('bcrypt');

const app = require('../api');
const { initApp } = require('../init');
const { sampleViewer1, sampleViewer2 } = require('../utils/tests/dataset');
const {
	createInitialViewer,
	viewersInDb,
	loginViewer,
	clearDb
} = require('../utils/tests/helpers');
const Viewer = require('../models/viewer');

let token;
const server = initApp(app);
const request = supertest(app);

beforeAll(async () => {
	await clearDb();
});

describe('fetch viewer object', () => {
	beforeEach(async () => {
		await Viewer.deleteMany({});
		await createInitialViewer();

		token = null;
		token = await loginViewer(request, sampleViewer1);
	});

	test('should successfully fetch all viewers', async () => {
		const viewers = await viewersInDb();

		const response = await request.
			get('/api/viewers/all')
			.expect('Content-Type', /application\/json/)
			.expect(200);

		const fetchedViewers = response.body;
		expect(fetchedViewers).toHaveLength(viewers.length);
	});
	test('should successfully fetch a specific viewer', async () => {
		const viewers = await viewersInDb();
		const response = await request.
			get(`/api/viewers/${viewers[0].id}`)
			.expect('Content-Type', /application\/json/)
			.expect(200);

		const fetchedViewer = response.body;
		expect(fetchedViewer.name).toEqual(viewers[0].name);
		expect(fetchedViewer.username).toEqual(viewers[0].username);
		expect(fetchedViewer.comments).toHaveLength(0);
	});
	test('should successfully fetch a specific viewer excluding passwordHash', async () => {
		const viewers = await viewersInDb();
		const response = await request.
			get(`/api/viewers/${viewers[0].id}`)
			.expect('Content-Type', /application\/json/)
			.expect(200);

		const fetchedViewer = response.body;
		expect(fetchedViewer.passwordHash).not.toBeDefined();
	});
	test('should fail to fetch a non existing viewer', async () => {
		const nonExistentId = new mongoose.Types.ObjectId();
		const response = await request.
			get(`/api/viewers/${nonExistentId}`)
			.expect('Content-Type', /application\/json/)
			.expect(404);

		const error = response.body.message;
		expect(error).toEqual('Viewer not found');
	});
});

describe('registration of viewer', () => {
	beforeEach(async () => {
		await Viewer.deleteMany({});
		await createInitialViewer();
	});
	test('should succesfully register a user/viewer', async () => {
		const response = await request.post('/api/viewers/register')
			.send(sampleViewer2)
			.expect('Content-Type', /application\/json/)
			.expect(201);

		const newViewerAccount = response.body;

		expect(newViewerAccount.name).toEqual(sampleViewer2.name);
		expect(newViewerAccount.username).toEqual(sampleViewer2.username);
		expect(newViewerAccount.comments).toHaveLength(0);
	});
	test('should fail to register a viewer with missing required fields', async () => {
		const incompleteViewer = {
			username: 'username123'
		};

		const response = await request.post('/api/viewers/register')
			.send(incompleteViewer)
			.expect('Content-Type', /application\/json/)
			.expect(400);

		const errors = response.body.errors;
		const msgs = errors.map(err => err.msg);
		expect(msgs).toContain('Name is required');
		expect(msgs).toContain('Password is required');
	});
	test('should fail to register if username is taken', async () => {
		const response = await request.post('/api/viewers/register')
			.send(sampleViewer1)
			.expect('Content-Type', /application\/json/)
			.expect(400);

		const error = response.body.error;
		expect(error).toEqual('Username is already taken');
	});
});

describe('login viewer', () => {
	beforeEach(async () => {
		await Viewer.deleteMany({});
		await createInitialViewer();
	});
	test('should succesfully login as a viewer', async () => {
		const response = await request.post('/api/viewers/login')
			.send({
				username: sampleViewer1.username,
				password: sampleViewer1.password
			})
			.expect('Content-Type', /application\/json/)
			.expect(200);

		const newViewerAccount = response.body;
		expect(newViewerAccount.token).not.toBeNull();
	});
	test('should fail to login with invalid username', async () => {
		const response = await request.post('/api/viewers/login')
			.send({
				username: 'randomusername123456',
				password: sampleViewer1.password
			})
			.expect('Content-Type', /application\/json/)
			.expect(400);

		const error = response.body.error;
		expect(error).toEqual('Invalid username');
	});
	test('should fail to login with invalid password', async () => {
		const response = await request.post('/api/viewers/login')
			.send({
				username: sampleViewer1.username,
				password: 'password123123123'
			})
			.expect('Content-Type', /application\/json/)
			.expect(400);

		const error = response.body.error;
		expect(error).toEqual('Invalid password');
	});
});

describe('deletion of viewer account', () => {
	beforeEach(async () => {
		await Viewer.deleteMany({});
		await createInitialViewer();

		token = null;
		token = await loginViewer(request, sampleViewer1);
	});
	test('should successfully delete a viewer account', async () => {
		const viewer = await Viewer.findOne({});

		const pwdConfirmationResponse = await request.post(
			`/api/viewers/${viewer._id}/confirm-password`)
			.send({ passwordInput: sampleViewer1.password })
			.set('Authorization', `Bearer ${token}`)
			.expect('Content-Type', /application\/json/)
			.expect(200);

		expect(pwdConfirmationResponse.body.result).toBeTruthy();

		await request.delete(`/api/viewers/${viewer._id}/delete`)
			.set('Authorization', `Bearer ${token}`)
			.expect(204);

		const updatedViewers = await viewersInDb();
		expect(updatedViewers).toHaveLength(0);
	});

	test('should fail to delete a viewer account if password input is wrong', async () => {
		const viewer = await Viewer.findOne({});
		const response = await request.post(`/api/viewers/${viewer._id}/confirm-password`)
			.send({ passwordInput: 'Iknowthepasswordherhehehe' })
			.set('Authorization', `Bearer ${token}`)
			.expect('Content-Type', /application\/json/)
			.expect(200);

		expect(response.body.result).toBeFalsy();
	});
});

describe('update of viewer', () => {
	beforeEach(async () => {
		await Viewer.deleteMany({});
		await createInitialViewer();

		token = null;
		token = await loginViewer(request, sampleViewer1);
	});

	test('should successfully update viewer document', async () => {
		const viewer = await Viewer.findOne({});

		const updatedViewer = {
			username: viewer.username,
			name: 'IAMTHEDANGER',
		};

		await request.put(`/api/viewers/${viewer._id}/update`)
			.send(updatedViewer)
			.set('Authorization', `Bearer ${token}`)
			.expect('Content-Type', /application\/json/)
			.expect(200);

		const updatedViewers = await viewersInDb();
		expect(updatedViewers[0]).toMatchObject({
			username: viewer.username,
			name: 'IAMTHEDANGER',
		});
	});
	test('should fail to update a non-existent viewer', async () => {
		const nonExistentId = new mongoose.Types.ObjectId();
		const passwordHash = bcrypt.hash('password123', 10);
		const updatedViewer = {
			username: 'nonExistentUser',
			name: 'John Doe',
			passwordHash
		};

		const response = await request.put(`/api/viewers/${nonExistentId}/update`)
			.send(updatedViewer)
			.set('Authorization', `Bearer ${token}`)
			.expect('Content-Type', /application\/json/)
			.expect(404);

		const error = response.body.error;
		expect(error).toEqual('Viewer not found');
	});
});

describe('password changes in viewer doc', () => {
	beforeEach(async () => {
		await Viewer.deleteMany({});
		await createInitialViewer();

		token = null;
		token = await loginViewer(request, sampleViewer1);
	});
	test('should successfully change the password with correct confirmation', async () => {
		const viewer = await Viewer.findOne({});

		const viewerPwdToUpdate = {
			currentPassword: sampleViewer1.password,
			newPassword: 'qwerty123',
			confirmNewPassword: 'qwerty123'
		};

		await request.put(`/api/viewers/${viewer._id}/change-password`)
			.send(viewerPwdToUpdate)
			.set('Authorization', `Bearer ${token}`)
			.expect('Content-Type', /application\/json/)
			.expect(200);

		const updatedViewer = await Viewer.findOne({});
		const passwordChanged = await bcrypt.compare(
			viewerPwdToUpdate.newPassword,
			updatedViewer.passwordHash
		);
		expect(passwordChanged).toBeTruthy();
	});
	test('should fail to change the password with incorrect confirmation', async () => {
		const viewer = await Viewer.findOne({});

		const updatedViewer = {
			currentPassword: 'wrongpasswordyup',
			newPassword: 'qwerty123',
			confirmNewPassword: 'qwerty123'
		};

		const response = await request.put(`/api/viewers/${viewer._id}/change-password`)
			.send(updatedViewer)
			.set('Authorization', `Bearer ${token}`)
			.expect('Content-Type', /application\/json/)
			.expect(400);

		const error = response.body.error;
		expect(error).toEqual('Current password is incorrect');
	});
	test('should fail to change the password with incorrect confirmation', async () => {
		const viewer = await Viewer.findOne({});

		const updatedViewer = {
			currentPassword: sampleViewer1.password,
			newPassword: 'qwerty123',
			confirmPassword: 'qwerty456'
		};

		const response = await request.put(`/api/viewers/${viewer._id}/change-password`)
			.send(updatedViewer)
			.set('Authorization', `Bearer ${token}`)
			.expect('Content-Type', /application\/json/)
			.expect(400);

		const error = response.body.error;
		expect(error).toEqual('Password confirmation does not match');
	});
});

afterAll(() => {
	mongoose.connection.close();
	server.close();
	console.log('Viewer Tests: Close the server');
});