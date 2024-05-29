export class Paparazzo {
  greet(name: string, happy = false) {
    return `Hello, ${name}${happy ? '!' : '.'}`;
  }
}
