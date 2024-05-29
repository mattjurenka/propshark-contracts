
/// Module: propshark_contracts
module propshark_contracts::propshark_contracts {
    use sui::table::{Self, Table};
    use sui::vec_map::{Self, VecMap};
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::sui::SUI;
    use sui::clock::Clock;

    use std::type_name::TypeName;
    use std::string::String;

    use deepbook::clob_v2::{Self, Pool, PoolOwnerCap, Order};
    use deepbook::custodian_v2::AccountCap;

    use suitears::dao::{Vote, Dao, Proposal};
    use suitears::dao_treasury::DaoTreasury;

    use propshark_contracts::propshark_accounting_token::PROPSHARK_ACCOUNTING_TOKEN;

    const ENotAuthorized: u64 = 0;
    const EInsufficientCollected: u64 = 1;
    const EAlreadyAuthorized: u64 = 2;
    const EExceedsFundraiseTarget: u64 = 3;

    // @dev The proposal has ended and failed to pass.  
    const DEFEATED: u8 = 3;

    // @dev The proposal has ended and it was successful. It will now be queued.  
    const AGREED: u8 = 4;

    public struct PROPSHARK_CONTRACTS has drop {}

    public struct AccountingTokenTreasuryHolder has key {
        id: UID,
        treasury: TreasuryCap<PROPSHARK_ACCOUNTING_TOKEN>
    }

    public fun create_accounting_token_holder(cap: TreasuryCap<PROPSHARK_ACCOUNTING_TOKEN>, ctx: &mut TxContext) {
        let holder = AccountingTokenTreasuryHolder {
            id: object::new(ctx),
            treasury: cap
        };
        transfer::share_object(holder);
    }

    public struct AccountBalance<phantom DaoWitness: drop> has store {
        account_cap: AccountCap,
        latest_vote: Option<Vote<DaoWitness, PROPSHARK_ACCOUNTING_TOKEN>>
    }

    public struct ProposalWithContract<phantom DaoWitness: drop> has key, store {
        id: UID,
        contract: String,
        proposal: Proposal<DaoWitness>
    }

    // contains total dividend payout, and then vecmap of ownership percentage at time of dividend payout
    public struct DividendPayout has store {
        total_payout: u64,
        ownership_map: VecMap<address, u64>
    }

    public struct Property<phantom CoinType, phantom DaoWitness: drop> has key, store {
        id: UID,
        holders: VecMap<address, AccountBalance<DaoWitness>>,
        dividend_payouts: vector<DividendPayout>,
        unpaid_dividends: Balance<CoinType>,
        orderbook: Pool<PROPSHARK_ACCOUNTING_TOKEN, CoinType>,
        pool_owner_cap: PoolOwnerCap,
        dao: Dao<DaoWitness>,
        dao_treasury: DaoTreasury<DaoWitness>,
        current_proposal: Option<ProposalWithContract<DaoWitness>>,
        passed_proposals: Table<u64, ProposalWithContract<DaoWitness>>,
        next_passed_proposal: u64,
        failed_proposals: Table<u64, ProposalWithContract<DaoWitness>>,
        next_failed_proposal: u64
    }

    public struct PropertyManagerCap has key, store {
        id: UID,
        authorized_id: ID
    }

    public struct Fundraise<phantom CoinType, phantom DaoWitness: drop> has key, store {
        id: UID,
        target_amount: u64,
        collected: Balance<CoinType>,
        collected_map: VecMap<address, u64>,
        dao: Dao<DaoWitness>,
        dao_treasury: DaoTreasury<DaoWitness>
    }

    public fun create_fundraise<CoinType, DaoWitness: drop>(target_amount: u64, dao: Dao<DaoWitness>, dao_treasury: DaoTreasury<DaoWitness>, ctx: &mut TxContext): (Fundraise<CoinType, DaoWitness>, PropertyManagerCap) {
        let fundraise_id = object::new(ctx);
        let authorized_id = fundraise_id.to_inner();
        (Fundraise {
            id: fundraise_id,
            target_amount,
            collected: balance::zero(),
            collected_map: vec_map::empty(),
            dao,
            dao_treasury
        }, PropertyManagerCap {
            id: object::new(ctx),
            authorized_id
        })
    }

    public fun authorize_fundraise_contributor<CoinType, DaoWitness: drop>(fundraise: &mut Fundraise<CoinType, DaoWitness>, contributor: address, manager_cap: &PropertyManagerCap) {
        verify_fundraise_manager_cap(fundraise, manager_cap);
        assert!(!fundraise.collected_map.contains(&contributor), EAlreadyAuthorized);

        fundraise.collected_map.insert(contributor, 0);
    }

    public fun contribute_to_fundraise<CoinType, DaoWitness: drop>(fundraise: &mut Fundraise<CoinType, DaoWitness>, coin: Coin<CoinType>, ctx: &mut TxContext) {
        assert!(!fundraise.collected_map.contains(&ctx.sender()), ENotAuthorized);
        assert!(fundraise.collected.value() + coin.value() <= fundraise.target_amount, EExceedsFundraiseTarget);

        let already_collected = fundraise.collected_map[&ctx.sender()];
        *fundraise.collected_map.get_mut(&ctx.sender()) = already_collected + coin.value();

        fundraise.collected.join(coin.into_balance());
    }

    public fun get_fundraise_values() {

    }

    fun get_ownership_map_from_fundraise_amounts<CoinType, DaoWitness: drop>(
        orderbook: &mut Pool<PROPSHARK_ACCOUNTING_TOKEN, CoinType>,
        collected_amount: u64,
        collected_map: VecMap<address, u64>,
        accounting_token_treasury_holder: &mut AccountingTokenTreasuryHolder,
        ctx: &mut TxContext
    ): VecMap<address, AccountBalance<DaoWitness>> {
        let (keys, mut values) = collected_map.into_keys_values();
        // replace values with the percentage collected, rather than the raw amount collected
        let mut i = 0;
        let max_size = values.length();
        while (i < max_size) {
            let value = values.borrow_mut(i);
            *value = (*value * 1_000_000_000) / collected_amount;
            i = i + 1;
        };

        let mut retval = vec_map::empty();
        while (i < max_size) {
            let account_cap = clob_v2::create_account(ctx);
            let accounting_token = coin::mint(&mut accounting_token_treasury_holder.treasury, values[i], ctx);
            orderbook.deposit_base(accounting_token, &account_cap);
            let balance = AccountBalance {
                account_cap,
                latest_vote: option::none()
            };
            retval.insert(keys[i], balance);
        };
        retval
    }

    public fun create_property<CoinType, DaoWitness: drop>(
        fundraise: Fundraise<CoinType, DaoWitness>,
        mut fundraise_cap: PropertyManagerCap,
        deepbook_fee: Coin<SUI>,
        accounting_token_treasury_holder: &mut AccountingTokenTreasuryHolder,
        ctx: &mut TxContext
    ): (Property<CoinType, DaoWitness>, Coin<CoinType>, PropertyManagerCap) {
        // send fundraise money to sender
        let Fundraise { id, dao, dao_treasury, collected, collected_map, target_amount } = fundraise;
        assert!(collected.value() >= target_amount, EInsufficientCollected);
        id.delete();

        let (mut orderbook, pool_owner_cap) = clob_v2::create_customized_pool_v2<PROPSHARK_ACCOUNTING_TOKEN, CoinType>(1_000_000, 1_000, 0, 0, deepbook_fee, ctx);
        let property_id = object::new(ctx);
        fundraise_cap.authorized_id = property_id.to_inner();
        return (
            Property<CoinType, DaoWitness> {
                id: property_id,
                holders: get_ownership_map_from_fundraise_amounts<CoinType, DaoWitness>(&mut orderbook, collected.value(), collected_map, accounting_token_treasury_holder, ctx),
                dividend_payouts: vector::empty<DividendPayout>(),
                unpaid_dividends: balance::zero(),
                orderbook,
                pool_owner_cap,
                dao,
                dao_treasury,
                current_proposal: option::none(),
                passed_proposals: table::new(ctx),
                next_passed_proposal: 0,
                failed_proposals: table::new(ctx),
                next_failed_proposal: 0
            },
            collected.into_coin(ctx),
            fundraise_cap
        )
    }

    public fun verify_property_manager_cap<CoinType, DaoWitness: drop>(property: &Property<CoinType, DaoWitness>, property_manager_cap: &PropertyManagerCap) {
        assert!(property.id.to_inner() == property_manager_cap.authorized_id, ENotAuthorized);
    }

    public fun verify_fundraise_manager_cap<CoinType, DaoWitness: drop>(fundraise: &Fundraise<CoinType, DaoWitness>, property_manager_cap: &PropertyManagerCap) {
        assert!(fundraise.id.to_inner() == property_manager_cap.authorized_id, ENotAuthorized);
    }

    public fun get_ownership_map<CoinType, DaoWitness: drop>(property: &Property<CoinType, DaoWitness>): VecMap<address, u64> {
        let mut i = 0;
        let size = property.holders.size();
        let mut retval = vec_map::empty<address, u64>();
        while (i < size) {
            let (owner, account_balance) = property.holders.get_entry_by_idx(i);
            let (avail, locked, _, _) = clob_v2::account_balance(&property.orderbook, &account_balance.account_cap);
            let vote_balance = if (account_balance.latest_vote.is_some()) {
                account_balance.latest_vote.borrow().balance()
            } else {
                0
            };
            retval.insert(*owner, avail + locked + vote_balance);
            i = i + 1;
        };
        retval
    }

    public fun payout_dividend<CoinType, DaoWitness: drop>(property: &mut Property<CoinType, DaoWitness>, dividend: Coin<CoinType>, manager_cap: &PropertyManagerCap) {
        verify_property_manager_cap(property, manager_cap);
        let payout = DividendPayout{
            total_payout: dividend.balance().value(),
            ownership_map: property.get_ownership_map()
        };
        coin::put(&mut property.unpaid_dividends, dividend);

        property.dividend_payouts.push_back(payout);
    }

    public fun collect_dividends<CoinType, DaoWitness: drop>(property: &mut Property<CoinType, DaoWitness>, ctx: &mut TxContext): Coin<CoinType> {
        let sender = ctx.sender();
        let mut i = 0;
        let size = property.dividend_payouts.length();
        let mut retval = coin::zero(ctx);
        while (i < size) {
            i = i + 1;
            let payout = &mut property.dividend_payouts[0];
            let ownership_map = &mut payout.ownership_map;
            if (ownership_map.contains(&sender)) {
                let pct_owned_unclaimed = ownership_map.get_mut(&sender);
                if (*pct_owned_unclaimed > 0) {
                    let balance_to_take = (*pct_owned_unclaimed) * (payout.total_payout) / 1_000_000_000;
                    retval.join(property.unpaid_dividends.split(balance_to_take).into_coin(ctx));
                    *pct_owned_unclaimed = 0;
                }
            }
        };
        retval
    }

    public fun transfer_ownership<CoinType, DaoWitness: drop>(property: &mut Property<CoinType, DaoWitness>, recipient: address, amount: u64, ctx: &mut TxContext) {
        assert!(property.holders.contains(&ctx.sender()), ENotAuthorized);
        assert!(property.holders.contains(&recipient), ENotAuthorized);
        let sender_account = &property.holders[&ctx.sender()];
        let recipient_account = &property.holders[&recipient];
        let withdrawn = property.orderbook.withdraw_base(amount, &sender_account.account_cap, ctx);
        property.orderbook.deposit_base(withdrawn, &recipient_account.account_cap);
    }

    public fun get_total_ownership_pct<CoinType, DaoWitness: drop>(property: &Property<CoinType, DaoWitness>, ctx: &TxContext): u64 {
        if (property.holders.contains(&ctx.sender())) {
            let account_balance = &property.holders[&ctx.sender()];
            let (avail, locked, _, _) = clob_v2::account_balance(&property.orderbook, &account_balance.account_cap);
            let vote_balance = if (account_balance.latest_vote.is_some()) {
                account_balance.latest_vote.borrow().balance()
            } else {
                0
            };
            avail + locked + vote_balance
        } else {
            0
        }
    }

    // === Orderbook Functions ===

    // place market order
    public fun place_market_order<CoinType, DaoWitness: drop>(
        property: &mut Property<CoinType, DaoWitness>,
        client_order_id: u64,
        quantity: u64,
        is_bid: bool,
        base_coin: Coin<PROPSHARK_ACCOUNTING_TOKEN>,
        quote_coin: Coin<CoinType>,
        clock: &Clock,
        ctx: &mut TxContext,
    ): (Coin<PROPSHARK_ACCOUNTING_TOKEN>, Coin<CoinType>) {
        assert!(property.holders.contains(&ctx.sender()), ENotAuthorized);
        let sender_account = &property.holders[&ctx.sender()];
        property.orderbook.place_market_order(&sender_account.account_cap, client_order_id, quantity, is_bid, base_coin, quote_coin, clock, ctx)
    }

    // place limit order
    public fun place_limit_order<CoinType, DaoWitness: drop>(
        property: &mut Property<CoinType, DaoWitness>,
        client_order_id: u64,
        price: u64,
        quantity: u64,
        self_matching_prevention: u8,
        is_bid: bool,
        expire_timestamp: u64,
        restriction: u8,
        clock: &Clock,
        ctx: &mut TxContext,
    ): (u64, u64, bool, u64) {
        assert!(property.holders.contains(&ctx.sender()), ENotAuthorized);
        let sender_account = &property.holders[&ctx.sender()];
        property.orderbook.place_limit_order(client_order_id, price, quantity, self_matching_prevention, is_bid, expire_timestamp, restriction, clock, &sender_account.account_cap, ctx)
    }

    // cancel order
    public fun cancel_order<CoinType, DaoWitness: drop>(property: &mut Property<CoinType, DaoWitness>, order_id: u64, ctx: &mut TxContext) {
        assert!(property.holders.contains(&ctx.sender()), ENotAuthorized);
        let sender_account = &property.holders[&ctx.sender()];
        property.orderbook.cancel_order(order_id, &sender_account.account_cap)

    }

    // clean_up_expired_orders
    public fun clean_up_expired_orders<CoinType, DaoWitness: drop>(property: &mut Property<CoinType, DaoWitness>, clock: &Clock, order_ids: vector<u64>, order_owners: vector<address>) {
        property.orderbook.clean_up_expired_orders(clock, order_ids, order_owners)
    }

    // list open orders
    public fun list_open_orders<CoinType, DaoWitness: drop>(property: &Property<CoinType, DaoWitness>, ctx: &TxContext): vector<Order> {
        assert!(property.holders.contains(&ctx.sender()), ENotAuthorized);
        let sender_account = &property.holders[&ctx.sender()];
        property.orderbook.list_open_orders(&sender_account.account_cap)
    }

    // get_market_price
    public fun get_market_price<CoinType, DaoWitness: drop>(property: &Property<CoinType, DaoWitness>): (Option<u64>, Option<u64>) {
        property.orderbook.get_market_price()
    }

    // get_level2_book_status_ask_side
    public fun get_level2_book_status_ask_side<CoinType, DaoWitness: drop>(property: &Property<CoinType, DaoWitness>, price_low: u64, price_high: u64, clock: &Clock): (vector<u64>, vector<u64>) {
        property.orderbook.get_level2_book_status_ask_side(price_low, price_high, clock)
    }

    // get_level2_book_status_bid_side
    public fun get_level2_book_status_bid_side<CoinType, DaoWitness: drop>(property: &Property<CoinType, DaoWitness>, price_low: u64, price_high: u64, clock: &Clock): (vector<u64>, vector<u64>) {
        property.orderbook.get_level2_book_status_bid_side(price_low, price_high, clock)
    }
    
    // === DAO Functions ===

    // property manager can create proposal
    public fun propose_manager<CoinType, DaoWitness: drop>(
        property: &mut Property<CoinType, DaoWitness>,
        clock: &Clock,
        property_manager_cap: &PropertyManagerCap,
        authorized_witness: Option<TypeName>,
        capability_id: Option<ID>,
        quorum_votes: u64,
        hash: String,
        contract: String,
        ctx: &mut TxContext
    ) {
        verify_property_manager_cap(property, property_manager_cap);
        property.propose(clock, authorized_witness, capability_id, quorum_votes, hash, contract, ctx);
    }

    // Anyone with ownership can create proposal
    public fun propose_owner<CoinType, DaoWitness: drop>(
        property: &mut Property<CoinType, DaoWitness>,
        clock: &Clock,
        authorized_witness: Option<TypeName>,
        capability_id: Option<ID>,
        quorum_votes: u64,
        hash: String,
        contract: String,
        ctx: &mut TxContext
    ) {
        assert!(property.holders.contains(&ctx.sender()), ENotAuthorized);
        property.propose(clock, authorized_witness, capability_id, quorum_votes, hash, contract, ctx);
    }

    // implementation for propose functions
    fun propose<CoinType, DaoWitness: drop>(
        property: &mut Property<CoinType, DaoWitness>,
        clock: &Clock,
        authorized_witness: Option<TypeName>,
        capability_id: Option<ID>,
        quorum_votes: u64,
        hash: String,
        contract: String,
        ctx: &mut TxContext
    ) {
        if (property.current_proposal.is_none()) {
            let proposal = property.dao.propose(clock, authorized_witness, capability_id, 0, quorum_votes, hash, ctx);
            property.current_proposal.fill(ProposalWithContract {
                id: object::new(ctx),
                contract,
                proposal
            });
        };
    }

    // execute to process proposal
    public fun process_proposal<CoinType, DaoWitness: drop>(
        property: &mut Property<CoinType, DaoWitness>,
        clock: &Clock
    ) {
        if (property.current_proposal.is_some()){
            let proposal_state = property.current_proposal.borrow().proposal.state(clock);
            if (proposal_state == AGREED) {
                let proposal = property.current_proposal.extract();
                property.passed_proposals.add(property.next_passed_proposal, proposal);
                property.next_passed_proposal = property.next_passed_proposal + 1;
            } else if (proposal_state == DEFEATED) {
                let proposal = property.current_proposal.extract();
                property.failed_proposals.add(property.next_failed_proposal, proposal);
                property.next_failed_proposal = property.next_failed_proposal + 1;
            }
        }
    }

    public fun unstake_vote<DaoWitness: drop, CoinType>(
        property: &mut Property<CoinType, DaoWitness>,
        has_passed: bool,
        idx: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(property.holders.contains(&ctx.sender()), ENotAuthorized);

        let sender_account = property.holders.get_mut(&ctx.sender());
        let proposal = if (has_passed) { &property.passed_proposals[idx].proposal } else { &property.failed_proposals[idx].proposal };
        let vote = sender_account.latest_vote.extract();
        let accounting_token = proposal.unstake_vote(vote, clock, ctx);
        property.orderbook.deposit_base(accounting_token, &sender_account.account_cap);
    }

    // cast_vote
    public fun cast_vote<DaoWitness: drop, CoinType>(
        property: &mut Property<CoinType, DaoWitness>,
        stake: u64,
        agree: bool,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        if (property.current_proposal.is_some()) {
            let proposal = &mut property.current_proposal.borrow_mut().proposal;

            let sender_account = property.holders.get_mut(&ctx.sender());
            // take out x amount from orderbook account 
            let voting_token = property.orderbook.withdraw_base(stake, &sender_account.account_cap, ctx);
            let vote = proposal.cast_vote(clock, voting_token, agree, ctx);
            // put vote into sender_account
            sender_account.latest_vote.fill(vote);
        }
    }
}

