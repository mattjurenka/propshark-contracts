module propshark_contracts::propshark_accounting_token {
    use sui::coin::Self;

    public struct PROPSHARK_ACCOUNTING_TOKEN has drop {}

    fun init(witness: PROPSHARK_ACCOUNTING_TOKEN, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(witness, 9, b"propAccounting", b"Propshark Accounting Token", b"", option::none(), ctx);
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury, tx_context::sender(ctx))
    }
}