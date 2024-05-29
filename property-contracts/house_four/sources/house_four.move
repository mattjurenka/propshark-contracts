/// Module: house_one
module house_four::house_four {
    use suitears::dao::{Self};
    use propshark_contracts::mock_usdc::MOCK_USDC;

    public struct HOUSE_FOUR has drop {}

    fun init(witness: HOUSE_FOUR, ctx: &mut TxContext) {
        let (dao, treasury) = dao::new<HOUSE_FOUR, MOCK_USDC>(witness, 0, 24 * 60 * 60 * 1_000, 500_000_000, 0, 0, ctx);
        transfer::public_transfer(dao, ctx.sender());
        transfer::public_transfer(treasury, ctx.sender());
    }
}
