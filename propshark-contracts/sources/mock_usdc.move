module propshark_contracts::mock_usdc {
    use sui::coin::Self;
    use sui::url;
    use std::ascii;

    public struct MOCK_USDC has drop {}

    fun init(witness: MOCK_USDC, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(witness, 6, b"mockUSDC", b"Mock USDC", b"Mock USDC coin for testing", option::some(url::new_unsafe(ascii::string(b"https://strapi-dev.scand.app/uploads/usdc_8cc5687a10.png"))), ctx);
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury, tx_context::sender(ctx))
    }
}