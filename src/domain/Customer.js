class Customer {
  constructor(id, name, email, phone, type, address) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.type = type;
    this.address = address;
  }

  hasValidEmail() {
    return Boolean(this.email) && this.email.includes("@");
  }

  getRegion() {
    return this.address.region;
  }

  getCity() {
    return this.address.city;
  }

  getState() {
    return this.address.state;
  }
}

module.exports = Customer;
