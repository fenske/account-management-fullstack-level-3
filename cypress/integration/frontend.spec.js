describe('Account Management Frontend - Level 3', () => {
  it('successfully loads, submits, and renders transactions', () => {
    cy.visit('/')

    cy.get('[data-type=account-id]').type('70ad2f95-aa52-4e04-a085-c5cc2a4d4ee4')
    cy.get('[data-type=amount]').type('30')
    cy.get('[data-type=transaction-form]').submit()

    cy.get('[data-type=transaction]').first().get('[data-account-id=70ad2f95-aa52-4e04-a085-c5cc2a4d4ee4][data-amount=30][data-balance=30]').should('exist')

    cy.get('[data-type=account-id]').type('aaad2f95-aa52-4e04-a085-c5cc2a4d4ee4')
    cy.get('[data-type=amount]').type('7')
    cy.get('[data-type=transaction-form]').submit()

    cy.get('[data-type=transaction]').first().get('[data-account-id=aaad2f95-aa52-4e04-a085-c5cc2a4d4ee4][data-amount=7][data-balance=7]').should('exist')

    cy.get('[data-type=account-id]').type('aaad2f95-aa52-4e04-a085-c5cc2a4d4ee4')
    cy.get('[data-type=amount]').type('-7')
    cy.get('[data-type=transaction-form]').submit()
 
    cy.get('[data-type=transaction]').first().get('[data-account-id=aaad2f95-aa52-4e04-a085-c5cc2a4d4ee4][data-amount=-7][data-balance=0]').should('exist')

    cy.get('[data-type=account-id]').type('fbe98173-3263-4f7a-8bfa-c3beebc90c24')
    cy.get('[data-type=amount]').type('10')
    cy.get('[data-type=transaction-form]').submit()

    cy.get('[data-type=account-id]').type('fbe98173-3263-4f7a-8bfa-c3beebc90c24')
    cy.get('[data-type=amount]').type('10')
    cy.get('[data-type=transaction-form]').submit()

    cy.get('[data-type=warning-message]').contains('You need to wait for 5 seconds before sending a duplicate transaction.')

    cy.wait(5000)

    cy.get('[data-type=account-id]').type('fbe98173-3263-4f7a-8bfa-c3beebc90c24')
    cy.get('[data-type=amount]').type('10')
    cy.get('[data-type=transaction-form]').submit()

    cy.get('[data-type=transaction]').first().get('[data-account-id=fbe98173-3263-4f7a-8bfa-c3beebc90c24][data-amount=10][data-balance=20]').should('exist')

  })
})
