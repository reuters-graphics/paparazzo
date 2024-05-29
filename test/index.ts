import 'dotenv/config';

import { Paparazzo } from './../dist/index.js';
import expect from 'expect.js';
import mock from 'mock-fs';

const paparazzo = new Paparazzo();

describe('test Paparazzo', function() {
  this.timeout(10000);

  before(function() {
    mock({});
  });

  after(function() {
    mock.restore();
  });

  it('Should greet', function() {
    expect(paparazzo.greet('Sue', true)).to.be('Hello, Sue!');
  });
});
