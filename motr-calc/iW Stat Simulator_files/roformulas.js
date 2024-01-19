//old- (Floor[{(atk)*(mod+% from players+%range attack-%race,size,element.card)+banes/masteries}*elemantal*e.def]-s.def)*bonus*hit
//wATK = [weaponBaseAtk + weaponBaseAtk*STR/200 + weaponUpgradeBonus - randomFactor];
//ATK = [ (2*sATK + (wATK * sizeMod + eATK) * raceMod * elementMod * bossMod * atkMod + masteryATK) * rangedMod ];
function GetBaseDmg( weaponElement, forced, addMasteries )
{
	//ATK = sATK * 2 + wATK + eATK + masteries
	//Weapon ATK = (Base Weapon ATK + Variance + STR Bonus + Refinement Bonus)*Size Penalty
	CalcAtk();
	CalcElementalMod( weaponElement );

	// reset values
	var damageRange = [0,0,0];

	// Calc Status attack with elemental modifier (it's always forced Neutral)
	var finalStatusAttack = Math.floor( statusAttack * 2 * statusElementalMod / 100 );

	// Calc Weapon attack with elemental modifier
	var finalWeaponAttack = new Array();
	var baseWeaponAttack = n_A_Weapon_ATK + strengthBonusAttack + weaponUpgradeAttack;
	if ( SkillSearch( skill_AX_ENCHANT_DEADLY_POISON ) )
	{
		baseWeaponAttack *= 5;
		equipmentAttack *= 4;
	}
	finalWeaponAttack[0] = ( baseWeaponAttack - varianceAttack + minOverrefineAttack ) * weaponSizeMod;
	finalWeaponAttack[2] = ( baseWeaponAttack + varianceAttack + overrefineAttack ) * weaponSizeMod;
	finalWeaponAttack[1] = Math.floor( ( finalWeaponAttack[0] + finalWeaponAttack[2] ) / 2 );
	var MB = 0;
	for ( var i = 0; i < 3; i++ )
	{
		// add equipment attack
		if (!noequipatk) finalWeaponAttack[i] += equipmentAttack;
		// multiply element mod
		if (otherBuffs[ksMagnumBreak]) {
			if (forced) {
				MB = finalWeaponAttack[i] * 0.2 * weaponElementalMod / 100;
			}
			else {
				MB = finalWeaponAttack[i] * 0.2 * element[n_B[en_ELEMENT]][ele_FIRE] / 100;
			}
		}
		finalWeaponAttack[i] *= weaponElementalMod / 100;
		finalWeaponAttack[i] += MB;
		// multiply race mod
		finalWeaponAttack[i] *= ( racialMod + 100 ) / 100;
		// multiply special race mod
		finalWeaponAttack[i] *= ( specialRacialMod + 100 ) / 100;
		// multiply size mod
		finalWeaponAttack[i] *= ( sizeMod + 100 ) / 100;
		// multiply boss mod
		finalWeaponAttack[i] *= ( bossMod + 100 ) / 100;
		// multiply attack mod
		finalWeaponAttack[i] *= attackMod;
	}
	// Build Damage Range
	for ( var i = 0; i < 3; i++ )
	{
		// Add Status attack, weapon attack and mastery attack
		damageRange[i] = finalStatusAttack + finalWeaponAttack[i] + masteryAttack + addMasteries;
		if (damageType == kDmgTypeRanged) {
			// Multiply by the ranged mod
			damageRange[i] *= ( rangedMod + 100 ) / 100;
		}
		// and floor
		damageRange[i] = Math.floor( damageRange[i] );
	}

	return damageRange;
}

//wATK = [weaponBaseAtk + weaponBaseAtk*STR/200 + weaponUpgradeBonus - randomFactor];
//ATK = [ (2*sATK + (wATK * sizeMod + eATK) * raceMod * elementMod * bossMod * atkMod + masteryATK) * rangedMod ];
function GetOffhandDmg( weaponElement )
{
	//ATK = sATK * 2 + wATK + eATK + masteries
	//Weapon ATK = (Base Weapon ATK + Variance + STR Bonus + Refinement Bonus)*Size Penalty
	CalcElementalMod( weaponElement );

	// reset values
	var damageRange = [0,0,0];

	// Calc Status attack with elemental modifier (it's always forced Neutral)
	var offhandStatusAttack = Math.floor( statusAttack * statusElementalMod / 100 );

	// Calc Weapon attack with elemental modifier
	var finalWeaponAttack = new Array();
	var baseWeaponAttack = n_A_Weapon2_ATK + strengthBonusAttack2 + weaponUpgradeAttack2;
	if ( SkillSearch( skill_AX_ENCHANT_DEADLY_POISON ) )
	{
		baseWeaponAttack *= 5;
		equipmentAttack *= 4;
	}
	finalWeaponAttack[0] = ( baseWeaponAttack - varianceAttack2 + minOverrefineAttack2 ) * weapon2SizeMod;
	finalWeaponAttack[2] = ( baseWeaponAttack + varianceAttack2 + overrefineAttack2 ) * weapon2SizeMod;
	finalWeaponAttack[1] = Math.floor( ( finalWeaponAttack[0] + finalWeaponAttack[2] ) / 2 );
	for ( var i = 0; i < 3; i++ )
	{
		// multiply element mod
		finalWeaponAttack[i] *= weaponElementalMod / 100;
	}

	// Build Damage Range
	for ( var i = 0; i < 3; i++ )
	{
		// Add Status attack, weapon attack and mastery attack
		damageRange[i] = offhandStatusAttack + finalWeaponAttack[i] + masteryAttack;
		if (n_A_JOB == cls_KAGOB)
			damageRange[i] *= ( 5.0 + SkillSearch( skill_AS_LEFTHAND_MASTERY ) ) / 10.0;
		else
			damageRange[i] *= ( 3.0 + SkillSearch( skill_AS_LEFTHAND_MASTERY ) ) / 10.0;

		// and floor
		damageRange[i] = Math.floor( damageRange[i] );
	}

	return damageRange;
}
function calcAttackSpecialBoosts() {
	var baseDamageMod = 100;
	if ( n_A_ActiveSkill != skill_MO_OCCULT_IMPACTION/* &&
		 n_A_ActiveSkill != skill_MO_GUILLOTINE_FIST &&
		 n_A_ActiveSkill != skill_MO_MAX_GUILLOTINE_FIST*/ ) //Dunno why should not work o.o
	{
		if (SkillSearch(skill_SW_BERSERK))
			baseDamageMod += 32;
		else if (otherBuffs[ksProvoke])
			baseDamageMod += 2 + 3 * otherBuffs[ksProvoke];
		else if (otherBuffs[ksAloe])
			baseDamageMod += 5;
		if (battleChantBuffs[pass_V_ATK])
			baseDamageMod += 100;
		if (otherBuffs[ksMurderBonus])
			baseDamageMod += 10;
		if (StPlusCalc2(87))
			baseDamageMod += StPlusCalc2(87);
		if (miscEffects[ksCursed])
			baseDamageMod -= 25;
	}
		n_A_Weapon_ATK = Math.floor(n_A_Weapon_ATK * baseDamageMod / 100.0);
		weaponUpgradeAttack = Math.floor(weaponUpgradeAttack * baseDamageMod / 100.0);
		statusAttack = Math.floor(statusAttack * baseDamageMod / 100.0);
		strengthBonusAttack = Math.floor(strengthBonusAttack * baseDamageMod / 100.0);
		equipmentAttack = Math.floor(equipmentAttack * baseDamageMod / 100.0);
		overrefineAttack = Math.floor(overrefineAttack * baseDamageMod / 100.0);
		varianceAttack = Math.floor(varianceAttack * baseDamageMod / 100.0);
		minOverrefineAttack = Math.floor(minOverrefineAttack * baseDamageMod / 100.0);
		if ( n_Nitou ) {
			n_A_Weapon2_ATK = Math.floor(n_A_Weapon2_ATK * baseDamageMod / 100.0);
			weaponUpgradeAttack2 = Math.floor(weaponUpgradeAttack2 * baseDamageMod / 100.0);
			strengthBonusAttack2 = Math.floor(strengthBonusAttack2 * baseDamageMod / 100.0);
			overrefineAttack2 = Math.floor(overrefineAttack2 * baseDamageMod / 100.0);
			varianceAttack2 = Math.floor(varianceAttack2 * baseDamageMod / 100.0);
			minOverrefineAttack2 = Math.floor(minOverrefineAttack2 * baseDamageMod / 100.0);
		}

}
function CalcAtk()
{
	ClearBonuses();

	// Calc pieces of attack formula
	statusAttack = CalcStatAtk();
	n_A_WeaponLV = ItemOBJ[n_A_Equip[eq_WEAPON]][itm_WLVL];
	n_A_Weapon_ATK = ItemOBJ[n_A_Equip[eq_WEAPON]][itm_ATK];
	if (otherBuffs[ksStriking] >= 1 && n_A_Equip[eq_WEAPON] !== 0) {
		n_A_Weapon_ATK += (8 + (otherBuffs[ksStriking] * 2)) * n_A_WeaponLV;
	}
	if (otherBuffs[ksStrikingEndowBonus] >= 1) {
	    n_A_Weapon_ATK += 5 * otherBuffs[ksStrikingEndowBonus];
	}
	if (otherBuffs[ksOdinsPower] >= 1) { // Odin's Power
		n_A_Weapon_ATK += 70+30*(otherBuffs[ksOdinsPower] - 1);
	}
	CalcUpgradeAtk();
	CalcVarianceAtk();
	CalcOverRefineAtk();
	equipmentAttack = CalcEquipAtk();
	masteryAttack = CalcMasteryAtk();
	CalcWeaponSizeMod();
	CalcRacialMod();
	CalcBossMod();
	CalcAttackMod();
	CalcCriticalMod();
	CalcRangedMod();
	CalcSpecialRacialMod();
	CalcSizeMod();
	if ( n_A_WeaponType != weapTyp_BOW &&
		 n_A_WeaponType != weapTyp_INSTRU &&
		 n_A_WeaponType != weapTyp_WHIP &&
		 n_A_WeaponType != weapTyp_HANDGUN &&
		 n_A_WeaponType != weapTyp_RIFLE &&
		 n_A_WeaponType != weapTyp_SHOTGUN &&
		 n_A_WeaponType != weapTyp_GATLING_GUN &&
		 n_A_WeaponType != weapTyp_GRENADE_LAUNCHER )
	{
		strengthBonusAttack = Math.floor( n_A_Weapon_ATK * n_A_STR / 200 );
	}
	else
	{
		strengthBonusAttack = Math.floor( n_A_Weapon_ATK * n_A_DEX / 200 );
	}
	if ( n_Nitou )
	{ // Dual Hand
		n_A_Weapon2LV = ItemOBJ[n_A_Equip[eq_WEAPONII]][itm_WLVL];
		n_A_Weapon2_ATK = ItemOBJ[n_A_Equip[eq_WEAPONII]][itm_ATK];
		strengthBonusAttack2 = Math.floor( n_A_Weapon2_ATK * n_A_STR / 200 );
		CalcUpgradeAtk2();
		CalcVarianceAtk2();
		CalcOverRefineAtk2();
	}
	calcAttackSpecialBoosts(); // BOOSTS THAT WERE CALCULATED IN CalcBaseDamageMods FUNCTION
}

function GetOldAtk()
{
	CalcAtk();

	// for damage calculation
	var tempAttack = equipmentAttack;
	tempAttack += (n_A_Weapon_ATK + weaponUpgradeAttack + overrefineAttack + strengthBonusAttack * element[n_B[en_ELEMENT]][ele_NEUTRAL] / 100) * weaponSizeMod;
	// multiply race mod
	tempAttack *= ( racialMod + 100 ) / 100;
	// multiply special race mod
	tempAttack *= ( specialRacialMod + 100 ) / 100;
	// multiply size mod
	tempAttack *= ( sizeMod + 100 ) / 100;
	// multiply boss mod
	tempAttack *= ( bossMod + 100 ) / 100;
	// multiply attack mod
	tempAttack *= ( attackMod + 100 ) / 100;
	tempAttack = (Max(tempAttack,0));
	return tempAttack;
}

function GetDisplayAtk()
{
	CalcAtk();

	// for damage calculation
	var tempAttack = equipmentAttack;
	tempAttack += n_A_Weapon_ATK + weaponUpgradeAttack + strengthBonusAttack + masteryAttack;
	tempAttack = (Max(tempAttack,0));
	return tempAttack;
}

function CalcStatAtk()
{
	statusAttack = 0;

	// LUK and Base Level
	statusAttack = ( n_A_LUK / 3 ) + ( n_A_BaseLV / 4 );

	if ( n_A_WeaponType != weapTyp_BOW &&
		 n_A_WeaponType != weapTyp_INSTRU &&
		 n_A_WeaponType != weapTyp_WHIP &&
		 n_A_WeaponType != weapTyp_HANDGUN &&
		 n_A_WeaponType != weapTyp_RIFLE &&
		 n_A_WeaponType != weapTyp_SHOTGUN &&
		 n_A_WeaponType != weapTyp_GATLING_GUN &&
		 n_A_WeaponType != weapTyp_GRENADE_LAUNCHER )
	{
		// ranged weapon, use DEX
		statusAttack += n_A_STR + ( n_A_DEX / 5 );
	}
	else
	{
		// melee, use STR
		statusAttack += n_A_DEX + ( n_A_STR / 5 );
	}

	return Math.floor( statusAttack );
}

function CalcUpgradeAtk()
{
	weaponUpgradeAttack = 0;

	if ( n_A_WeaponLV === 1 )
	{
		weaponUpgradeAttack = n_A_Weapon_ATKplus * 2;
	}
	else if ( n_A_WeaponLV === 2 )
	{
		weaponUpgradeAttack = n_A_Weapon_ATKplus * 3;
	}
	else if ( n_A_WeaponLV === 3 )
	{
		weaponUpgradeAttack = n_A_Weapon_ATKplus * 5;
	}
	else if ( n_A_WeaponLV === 4 )
	{
		weaponUpgradeAttack = n_A_Weapon_ATKplus * 7;
	}
}

function CalcUpgradeAtk2()
{
	weaponUpgradeAttack2 = 0;

	if ( n_Nitou )
	{
		if ( n_A_Weapon2LV == 1 )
		{
			weaponUpgradeAttack2 = n_A_Weapon2_ATKplus * 2;
		}
		else if ( n_A_Weapon2LV == 2 )
		{
			weaponUpgradeAttack2 = n_A_Weapon2_ATKplus * 3;
		}
		else if ( n_A_Weapon2LV == 3 )
		{
			weaponUpgradeAttack2 = n_A_Weapon2_ATKplus * 5;
		}
		else if ( n_A_Weapon2LV == 4 )
		{
			weaponUpgradeAttack2 = n_A_Weapon2_ATKplus * 7;
		}
	}
}

function CalcVarianceAtk()
{
	varianceAttack = 0;

	varianceAttack = n_A_Weapon_ATK * 0.05 * n_A_WeaponLV;
}

function CalcVarianceAtk2()
{
	varianceAttack2 = 0;

	if ( n_Nitou )
	{
		varianceAttack2 = n_A_Weapon2_ATK * 0.05 * n_A_Weapon2LV;
	}
}

function CalcOverRefineAtk()
{
	overrefineAttack = 0;

	if ( n_A_WeaponLV == 1 )
	{
		if ( n_A_Weapon_ATKplus >= 8 )
		{
			overrefineAttack = 3 * ( n_A_Weapon_ATKplus - 7 );
		}
	}
	else if ( n_A_WeaponLV == 2 )
	{
		if ( n_A_Weapon_ATKplus >= 7 )
		{
			overrefineAttack = 5 * ( n_A_Weapon_ATKplus - 6 );
		}
	}
	else if ( n_A_WeaponLV == 3 )
	{
		if ( n_A_Weapon_ATKplus >= 6 )
		{
			overrefineAttack = 8 * ( n_A_Weapon_ATKplus - 5 );
		}
	}
	else if ( n_A_WeaponLV == 4 )
	{
		if ( n_A_Weapon_ATKplus >= 5 )
		{
			overrefineAttack = 14 * ( n_A_Weapon_ATKplus - 4 );
		}
	}

	minOverrefineAttack = 0;
	if ( overrefineAttack > 0 )
	{
		minOverrefineAttack = 1;
	}
}

function CalcOverRefineAtk2()
{
	overrefineAttack2 = 0;

	if ( n_Nitou )
	{
		if ( n_A_Weapon2LV == 1 )
		{
			if ( n_A_Weapon2_ATKplus >= 8 )
			{
				overrefineAttack2 = 3 * ( n_A_Weapon2_ATKplus - 7 );
			}
		}
		else if ( n_A_Weapon2LV == 2 )
		{
			if ( n_A_Weapon2_ATKplus >= 7 )
			{
				overrefineAttack2 = 5 * ( n_A_Weapon2_ATKplus - 6 );
			}
		}
		else if ( n_A_Weapon2LV == 3 )
		{
			if ( n_A_Weapon2_ATKplus >= 6 )
			{
				overrefineAttack2 = 8 * ( n_A_Weapon2_ATKplus - 5 );
			}
		}
		else if ( n_A_Weapon2LV == 4 )
		{
			if ( n_A_Weapon2_ATKplus >= 5 )
			{
				overrefineAttack2 = 14 * ( n_A_Weapon2_ATKplus - 4 );
			}
		}
	}

	minOverrefineAttack2 = 0;
	if ( overrefineAttack2 > 0 )
	{
		minOverrefineAttack2 = 1;
	}
}

function CalcEquipAtk()
{
	equipmentAttack = 0;

	// Get attack from
	equipmentAttack=n_tok[bon_ATK]; // cur eqAtk

	// Projectiles
	if ( n_A_WeaponType === weapTyp_BOW ||
		 n_A_WeaponType === weapTyp_INSTRU ||
		 n_A_WeaponType === weapTyp_WHIP ||
		 n_A_WeaponType === weapTyp_HANDGUN ||
		 n_A_WeaponType === weapTyp_RIFLE ||
		 n_A_WeaponType === weapTyp_SHOTGUN ||
		 n_A_WeaponType === weapTyp_GATLING_GUN ||
		 n_A_WeaponType === weapTyp_GRENADE_LAUNCHER )
	{ // Arrows
		equipmentAttack += ArrowOBJ[n_A_Arrow][arr_att_ATK];
	}
	if ( n_A_ActiveSkill ===  skill_GEN_CART_CANNON )
	{ // Cannon Balls
		equipmentAttack += CannonBallOBJ[n_A_Arrow][arr_att_ATK];
	}
	if ( SkillSearch(skill_SOR_SUMMON_TYPE) == 0 && SkillSearch(skill_SOR_SUMMON_LEVEL) > 0 && SkillSearch(skill_SOR_SPIRIT_CONTROL) == 1 ) {
		//Agni
		equipmentAttack += 60*SkillSearch(skill_SOR_SUMMON_LEVEL);
	}

	if ( otherBuffs[ksElementField] == ksVolcano && otherBuffs[ksElementFieldLvl] >= 1 )
	{ // Volcano
		equipmentAttack += otherBuffs[ksElementFieldLvl] * 10;
	}

	// items
	if ( usableItems[ksRainbowCake] )
	{
		equipmentAttack += 10;
	}
	if ( usableItems[ksBoxOfResentment] )
	{
		equipmentAttack += 20;
	}
	if ( usableItems[ksRuneStrawberryCake] )
	{
		equipmentAttack += 5;
	}
	if ( usableItems[ksDurian] )
	{
		equipmentAttack += 10;
	}
	if ( usableItems[ksPinkRation] )
	{
		equipmentAttack += 15;
	}
	if ( usableItems[ksDistilledFightingSpirit] )
	{
		equipmentAttack += 30;
	}

	// Cards
	if(CardNumSearch(515) && n_A_Weapon_ATKplus >= 12) // Tendrillion
		equipmentAttack += 35;
	if ( SU_STR >= 80 && CardNumSearch( 267 ) )
	{ // GWhisper
		equipmentAttack += 20;
	}
	if ( CardNumSearch( 492 ) )
	{ // Ifrit
		equipmentAttack += Math.floor( n_A_JobLV / 10 ) * CardNumSearch( 492 );
	}

	// Ice Pick Effect
	if ( n_tok[bon_ICE_PICK] )
	{ // adds (monsters def)/2 equip attack
		equipmentAttack += Math.floor( n_B[en_HARDDEF] / 2 );
	}

	// Equipment
	if ( SU_STR >= 95 && EquipNumSearch( 621 ) )
	{ //DoomSlayer
		equipmentAttack += 340;
	}
	if ( SU_STR >= 44 && EquipNumSearch( 625 ) )
	{ // Holgrens Refining Hammer
		equipmentAttack += 44;
	}
	if ( SU_AGI >= 90 && EquipNumSearch( 442 ) )
	{ // Rogue's Treasure
		equipmentAttack += 10 * EquipNumSearch( 442 );
	}
	if ( SU_STR >= 95 && EquipNumSearch( 1160 ) )
	{ // Krasnaya
		equipmentAttack += 20;
	}
	if ( SU_LUK >= 90 && EquipNumSearch( 1164 ) )
	{ // Berchel Axe
		equipmentAttack += 20;
	}
	if ( EquipNumSearch( 676 ) )
	{ // Mythical Lion Mask
		equipmentAttack += n_A_HEAD_DEF_PLUS * 2;
	}
	if ( EquipNumSearch( 1120 ) && n_A_JobSearch() === cls_ARC )
	{ // Archer Figurine
		equipmentAttack += 10;
	}
	if ( EquipNumSearch( 1165 ) )
	{ // Veteran Axe
		equipmentAttack += 10 * SkillSearch( 311 );
	}
	if ( SU_STR >= 120 && EquipNumSearch( 1253 ) )
	{ // Rune Circlet
		equipmentAttack += 10;
	}
	if ( SU_STR >= 120 && EquipNumSearch( 1256 ) )
	{ // Driver Band
		equipmentAttack += 10;
	}
	if ( SU_AGI >= 120 && EquipNumSearch( 1257 ) )
	{ // Shadow Crown
		equipmentAttack += 10;
	}
	if ( SU_STR >= 120 && EquipNumSearch( 1259 ) )
	{ // Midas Whispers
		equipmentAttack += 5;
	}
	if ( SU_STR >= 120 && EquipNumSearch( 1261 ) )
	{ // Burning Spirit
		equipmentAttack += 10;
	}
	if ( SU_AGI >= 120 && EquipNumSearch( 1262 ) )
	{ // Silent Enforcer
		equipmentAttack += 10;
	}
	if ( EquipNumSearch( 1218 ) && n_A_HEAD_DEF_PLUS >= 5 )
	{ // Moon Rabbit Hat
		equipmentAttack += n_A_HEAD_DEF_PLUS - 4;
	}
	if ( EquipNumSearch( 1336 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Aquarius Diadem
		equipmentAttack += 15;
	}
	if ( EquipNumSearch( 1345 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Scorpio Diadem
		equipmentAttack += 5;
	}
	if ( EquipNumSearch( 1347 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Aquarius Crown
		equipmentAttack += 15;
	}
	if ( EquipNumSearch( 1349 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Cancer Crown
		equipmentAttack += 15;
	}
	if ( EquipNumSearch( 1355 ) && n_A_HEAD_DEF_PLUS >= 10 )
	{ // Scorpio Crown
		equipmentAttack += 5;
	}
	if ( EquipNumSearch( 1365 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Gemini Crown
		equipmentAttack += 15;
	}
	if ( SU_STR >= 120 && EquipNumSearch( 1386 ) )
	{ // Gigantic Lance
		equipmentAttack += 300;
	}
	if ( EquipNumSearch( 953 ) || EquipNumSearch( 1499 ) )
	{ // Giant Majestic Goat
		equipmentAttack += Math.floor(n_A_JobLV/7*2);
	}
	if ( EquipNumSearch( 1464 ) )
	{ //Heroic Backpack
		if (n_A_SHOULDER_DEF_PLUS >= 7 && SU_STR >= 90) { equipmentAttack += 20; }
		if (n_A_SHOULDER_DEF_PLUS >= 9 && SU_STR >= 90) { equipmentAttack += 10; }
	}
	if ( EquipNumSearch( 1487 ) )
	{ // "RWC Memory Knife"
		equipmentAttack += Math.floor(n_A_Weapon_ATKplus/3)*20;
	}
	if ( EquipNumSearch( 1488 ) )
	{ // "RWC Memory Mace"
		equipmentAttack += Math.floor(n_A_Weapon_ATKplus/3)*30;
	}
	if ( EquipNumSearch( 1490 ) )
	{ // "RWC Memory Knife + RWC 2012 Ring"
		equipmentAttack += n_A_Weapon_ATKplus*10;
	}
	if ( EquipNumSearch( 1492 ) )
	{ // "RWC Memory Mace + RWC 2012 Ring"
		equipmentAttack += n_A_Weapon_ATKplus*5;
	}

	// Skills
	if( SkillSearch( skill_GS_LAST_STAND ) )
	{ // LastStand
		equipmentAttack += 100;
	}
	if ( SkillSearch( skill_GS_GATLING_FEVER ) )
	{ // Gatling Fever
		if ( n_A_WeaponType === weapTyp_GATLING_GUN || n_A_WeaponType === weapTyp_NONE )
		{
			equipmentAttack += 20 + 10 * SkillSearch( skill_GS_GATLING_FEVER );
		}
	}
	if ( SkillSearch( skill_ROY_SHIELD_SPELL ) === 1 )
	{ // Shield Spell
		equipmentAttack += ItemOBJ[n_A_Equip[eq_SHIELD]][itm_DEF];
	}
	if ( SkillSearch( skill_ROY_BANDING ) )
	{ // Banding ATK increase: [# of Royal Guard party members x (10 + 10 * Skill Level)]
		equipmentAttack += ( 10 + 10 * SkillSearch( skill_ROY_BANDING ) ) * SkillSearch( skill_ROY_NUM_GUARDS );
	}
	if ( SkillSearch( skill_ROY_INSPIRATION ) )
	{ // Inspiration [Skill Level x 40 ] + [Caster’s Job Level x 3 ]
		equipmentAttack += ( 40 * SkillSearch( skill_ROY_INSPIRATION ) ) + ( 3 * n_A_JobLV );
	}
	if ( performerBuffs[ksEnsemble] === ksBattleTheme && performerBuffs[ksEnsembleLevel] > 0 )
	{ // Battle Theme
		equipmentAttack += 125 + ( 25 * performerBuffs[ksEnsembleLevel] );
	}
	if ( acolyteBuffs[ksImposito] > 0 )
	{ // Imposito Manus
		equipmentAttack += acolyteBuffs[ksImposito] * 5;
	}
	if ( performerBuffs[ksChorus] === ksSaturdayNightFever &&
		 performerBuffs[ksChorusLevel] > 0 &&
		 performerBuffs[ksNumPerformers] >= 2 )
	{ // Saturday Night Fever
		var skillBonus = performerBuffs[ksChorusLevel] * 100;

		equipmentAttack += skillBonus;
	}
	if ( SkillSearch( skill_GEN_CART_BOOST ) )
	{ // Cart boost
		equipmentAttack += 10 * SkillSearch( skill_GEN_CART_BOOST );
	}
	if ( SkillSearch( skill_RUN_FIGHTING_SPIRIT ) )
	{ // Asir Rune
		equipmentAttack += SkillSearch( skill_RUN_FIGHTING_SPIRIT ) * 7;
	}
	if ( performerBuffs[ksMaestroSolo] === ksWindmillRush && performerBuffs[ksMaestroSoloLevel] > 0 )
	{ // Windmill Rush
		var skillBonus = performerBuffs[ksMaestroSoloLevel] * 6;
		var voiceLessonsBonus = performerBuffs[ksMaestroVoiceLessons];
		var jobLvlBonus = performerBuffs[ksMaestroJobLevel] / 5.0;

		equipmentAttack += Math.floor( skillBonus + voiceLessonsBonus + jobLvlBonus );
	}
	if ( performerBuffs[ksChorus] === ksDancesWithWargs &&
		 performerBuffs[ksChorusLevel] > 0 &&
		 performerBuffs[ksNumPerformers] >= 2 )
	{ // Dances with Wargs
		var skillBonus = performerBuffs[ksChorusLevel] * 2;
		var performerBonus = performerBuffs[ksNumPerformers];

		if ( performerBonus > 7 )
		{
			performerBonus = 7;
		}

		equipmentAttack += skillBonus * performerBonus;
	}
	if ( SkillSearch( skill_SUR_GENTLE_TOUCH_CHANGE ) || acolyteBuffs[ksPPChange] > 0 )
	{ // Gentle Touch Convert: ATK [{(Caster’s DEX / 4) + (Caster’s STR / 2)} x Skill Level / 5]
		if ( SkillSearch( skill_SUR_GENTLE_TOUCH_CHANGE ) )
		{
			var dexBonus = n_A_DEX / 4.0;
			var strBonus = n_A_STR / 2.0;
			var attackBonus = Math.floor( ( dexBonus + strBonus ) * SkillSearch( skill_SUR_GENTLE_TOUCH_CHANGE ) / 5.0 );
			equipmentAttack += attackBonus;
		}
		else
		{
			var dexBonus = acolyteBuffs[ksSuraDexterity] / 4.0;
			var strBonus = acolyteBuffs[ksSuraStrength] / 2.0;
			equipmentAttack += Math.floor( ( dexBonus + strBonus ) * acolyteBuffs[ksPPChange] / 5.0 );
		}
	}

	if (SkillSearch(skill_SUR_FLASH_COMBO)) {
	    equipmentAttack += 40 * SkillSearch(skill_SUR_FLASH_COMBO);
	}

	return equipmentAttack;
}

function CalcMasteryAtk()
{
	masteryAttack = 0;

	// weapon masteries
	if ( n_A_WeaponType == weapTyp_DAGGER || n_A_WeaponType == weapTyp_SWORD )
	{ // sword mastery/training
		masteryAttack += 4 * SkillSearch( skill_SW_SWORD_MASTERY );
		masteryAttack += 10 * SkillSearch( skill_GEN_SWORD_TRAINING );
	}
	if ( n_A_WeaponType == weapTyp_SWORDII)
	{ // two handed sword mastery
		masteryAttack += 4 * SkillSearch( skill_SW_TWO_HAND_SWORD_MASTERY );
	}
	if ( n_A_WeaponType == weapTyp_SPEAR || n_A_WeaponType == weapTyp_SPEARII )
	{ // spear mastery
		masteryAttack += 4 * SkillSearch( skill_KN_SPEAR_MASTERY );

		if ( SkillSearch( skill_KN_CAVALIER_MASTERY ) > 0 ||
			 SkillSearch( skill_RUN_DRAGON_TRAINING ) > 0 )
		{
			masteryAttack += SkillSearch( skill_KN_SPEAR_MASTERY );
		}
	}
	if ( n_A_WeaponType == weapTyp_AXE || n_A_WeaponType == weapTyp_AXEII )
	{ // alchemist or mechanic axe mastery
		masteryAttack += 3 *SkillSearch( skill_AL_AXE_MASTERY );
		masteryAttack += 5 * SkillSearch( skill_MEC_AXE_TRAINING );
	}
	if ( n_A_WeaponType == weapTyp_MACE )
	{ // mace mastery
		masteryAttack += 3 * SkillSearch( skill_PR_MACE_MASTERY );
		masteryAttack += 4 * SkillSearch( skill_MEC_AXE_TRAINING );
	}
	if ( n_A_WeaponType == weapTyp_KATAR)
	{ // katar mastery
		masteryAttack += 3 * SkillSearch( skill_AS_KATAR_MASTERY );
	}
	if ( n_A_WeaponType == weapTyp_BOOK)
	{ // study
		masteryAttack += 3 * SkillSearch( skill_SA_STUDY );
	}
	if ( n_A_WeaponType == weapTyp_KNUCKLE || n_A_WeaponType == weapTyp_NONE )
	{ // iron fist
		masteryAttack += 3 * SkillSearch( skill_MO_IRON_FIST );
	}
	if ( n_A_WeaponType == weapTyp_INSTRUMENT)
	{ // music lessons
		masteryAttack += 3 * SkillSearch( skill_BA_MUSIC_LESSONS );
	}
	if ( n_A_WeaponType == weapTyp_WHIP)
	{ // dance lessons
		masteryAttack += 3 * SkillSearch( skill_DA_DANCE_LESSONS );
	}
	if ( n_A_WeaponType == weapTyp_NONE && SkillSearch( skill_TK_SPRINT ) )
	{ // sprint
		masteryAttack += 10 * SkillSearch(skill_TK_SPRINT );
	}
	if ( n_A_WeaponType !== weapTyp_NONE && SkillSearch( skill_LK_AURA_BLADE ) )
	{ // aura blade
		masteryAttack += 20 * SkillSearch( skill_LK_AURA_BLADE );
	}
	if ( n_A_WeaponType == weapTyp_NONE && SkillSearch( skill_TK_SPRINT ) )
	{ // sprint bonus to kicks
		if ( n_A_ActiveSkill == skill_TK_TORNADO_KICK ||
			 n_A_ActiveSkill == skill_TK_HEEL_DROP ||
			 n_A_ActiveSkill == skill_TK_ROUNDOUSE ||
			 n_A_ActiveSkill == skill_TK_COUNTER_KICK )
		{
			masteryAttack += 10 * SkillSearch(skill_TK_SPRINT);
		}
	}

	// Star Crumbs
	var weaponOneCrumbs = 0;
	for ( var i = 0; i < 4; i++ )
	{
		if ( n_A_card[i] === 106 )
		{
			weaponOneCrumbs++;
		}
	}
	if ( weaponOneCrumbs > 0 )
	{
		if ( weaponOneCrumbs === 1 )
		{
			masteryAttack += 5;
		}
		else if ( weaponOneCrumbs === 2 )
		{
			masteryAttack += 10;
		}
		else
		{
			masteryAttack += 40;
		}
	}
	var weaponTwoCrumbs = 0;
	for ( var i = 4; i < 8; i++ )
	{
		if ( n_A_card[i] === 106 )
		{
			weaponTwoCrumbs++;
		}
	}
	if ( weaponTwoCrumbs > 0 )
	{
		if ( weaponTwoCrumbs === 1 )
		{
			masteryAttack += 5;
		}
		else if ( weaponTwoCrumbs === 2 )
		{
			masteryAttack += 10;
		}
		else
		{
			masteryAttack += 40;
		}
	}

	// skill masteries
	if ( SkillSearch( skill_BS_WEAPONRY_RESEARCH ) )
	{ // weapon research
		masteryAttack += 2 * SkillSearch( skill_BS_WEAPONRY_RESEARCH );
	}
	if ( SkillSearch( skill_MEC_MAGIC_GEAR_LICENSE ) )
	{ // mado license
		masteryAttack += 15 * SkillSearch( skill_MEC_MAGIC_GEAR_LICENSE );
	}
	if ( SkillSearch( skill_MO_SUMMON_SPIRIT_SPHERE ) )
	{ // spirit spheres
		masteryAttack += 3 * SkillSearch( skill_MO_SUMMON_SPIRIT_SPHERE );
	}
	else if ( acolyteBuffs[ksSpheres] )
	{ // spirit spheres for non-monks
		masteryAttack += 3 * acolyteBuffs[ksSpheres];
	}
	if ( SkillSearch( skill_GS_COIN_FLIP ) )
	{ // Coin Flip
		masteryAttack += 3 * SkillSearch( skill_GS_COIN_FLIP );
	}
	if ( performerBuffs[ksEnsemble] === ksHarmonicLick &&
	     performerBuffs[ksEnsembleLevel] > 0 &&
	     n_A_WeaponLV === 4 )
	{ // Harmonic Lick
		masteryAttack += 50 + 25 * performerBuffs[ksEnsembleLevel];
	}
	if(n_B[en_RACE] == race_DEMON || (90 <= n_B[en_ELEMENT] && n_B[en_ELEMENT] <= 99))
	{ // Undead 1~9
		if(SkillSearch(skill_AC_DEMON_BANE))
		{ // Demon Bane
			masteryAttack += Math.floor((3 + 5/100 * n_A_BaseLV) * SkillSearch(skill_AC_DEMON_BANE));
		}
	}
	if(n_B[en_RACE] == race_BRUTE || n_B[en_RACE] == race_INSECT)
	{ // Best Bane
		masteryAttack += 4 * SkillSearch(skill_HU_BEAST_BANE);
		if(SkillSearch(skill_HU_HUNTER_SPIRIT))
		{ // Hunter Spirit
			masteryAttack += n_A_STR;
		}
	}
	if ( n_B[en_RACE] == race_BRUTE || n_B[en_RACE] == race_PLANT || n_B[en_RACE] == race_FISH )
	{ // Ranger Main
		masteryAttack += 5 * SkillSearch( skill_RAN_RANGER_MAIN );
	}
	if ( ( n_B[en_ELEMENT] >= ( ele_EARTH * 10 ) && n_B[en_ELEMENT] <= ( ele_EARTH * 10 + 9 ) ) ||
	     ( n_B[en_ELEMENT] >= ( ele_FIRE  * 10 ) && n_B[en_ELEMENT] <= ( ele_FIRE  * 10 + 9 ) ) )
	{ // Fire and Earth Research
		masteryAttack += 10 * SkillSearch( skill_MEC_RESEARCH_FIRE_EARTH );
	}
	if ( SkillSearch( skill_RAN_CAMOUFLAGE ) )
	{ // Camouflage
		masteryAttack += 300;
	}

	return Math.floor( masteryAttack );
}

function CalcElementalMod( weaponElement )
{ // Elemental modifiers
	weaponElementalMod = element[n_B[en_ELEMENT]][weaponElement];
	statusElementalMod = element[n_B[en_ELEMENT]][ele_NEUTRAL];
	if ( monsterBuffs[status_en_buff_Elemental] )
	{ // Elemental Reduction
		weaponElementalMod -= monsterBuffs[status_en_buff_Elemental];
	}
	// Card Bonuses
	if (not_use_card != 1)
		weaponElementalMod += n_tok[bon_DMG_ELE_NEUTRAL + Math.floor( n_B[en_ELEMENT] / 10 )];
}

function CalcRacialMod()
{ // phyisical and magical calculated, only physical saved out.
	racialMod = 0;

	// Racial bonuses
	if ( n_A_Arrow == arrTyp_HOLY )
	{
		n_tok[bon_DMG_RC_DEMON] += 5;
	}
	if ( SkillSearch( skill_SA_DRAGONOLOGY ) )
	{
		n_tok[bon_DMG_RC_DRAGON] += SkillSearch( skill_SA_DRAGONOLOGY ) * 4;
	}
	if ( EquipNumSearch( 1335 ) && n_A_HEAD_DEF_PLUS >= 5 )
	{ // Cat Ear Beret
		for ( var i = 5; i <= 12; i++ )
		{ // bonus is applied for levels 5-12
			if ( i <= n_A_HEAD_DEF_PLUS )
			{
				n_tok[bon_DMG_RC_DEMI_HUMAN] += 2;
			}
		}
	}

	// Magical
	if ( EquipNumSearch( 1250 ) && n_A_HEAD_DEF_PLUS >= 5 )
	{ // Red Pom Hat
		n_tok[bon_MDMG_RC_DEMI_HUMAN] += n_A_HEAD_DEF_PLUS * 2;
	}
	//GLORIOUS WEAPONS
	if ( (EquipNumSearch( 1076 ) || EquipNumSearch( 1077 ) || EquipNumSearch( 1081 ) ||
		  EquipNumSearch( 1082 ) || EquipNumSearch( 1086 ) || EquipNumSearch( 1088 ) ||
		  EquipNumSearch( 1089 ) || EquipNumSearch( 1090 ) || EquipNumSearch( 1091 ) ||
		  EquipNumSearch( 1092 ) || EquipNumSearch( 1093 ) || EquipNumSearch( 1094 ) ||
		  EquipNumSearch( 1096 ) || EquipNumSearch( 1097 ) || EquipNumSearch( 1100 ) ||
		  EquipNumSearch( 1101 ) || EquipNumSearch( 1102 ) || EquipNumSearch( 1103 )) && n_A_Weapon_ATKplus >= 6 ) {
		n_tok[bon_DMG_RC_DEMI_HUMAN] += Math.pow(Math.min(10, n_A_Weapon_ATKplus-4), 2);
	}
	if ( (EquipNumSearch( 1080 ) || EquipNumSearch( 1087 ) || EquipNumSearch( 1098 )) && n_A_Weapon_ATKplus >= 6 ) {
		n_tok[bon_DMG_RC_DEMI_HUMAN] += Math.pow(Math.min(10, n_A_Weapon_ATKplus-3), 2);
	}
	if (not_use_card == 1)
		racialMod = 0;
	else
		racialMod = n_tok[bon_DMG_RC_FORMLESS + n_B[en_RACE]];
	if ( monsterBuffs[status_en_buff_Race] )
	{ // Race Reduction
		racialMod -= monsterBuffs[status_en_buff_Race];
	}
}

function CalcSpecialRacialMod()
{
	specialRacialMod = 0;

	if ( ( n_B[en_ID] >= 108 && n_B[en_ID] <= 115 ) || n_B[en_ID] === 319 )
	{ // Goblins
		specialRacialMod = n_tok[bon_DMG_GOBLIN];
	}
	if ( n_B[en_ID] >= 116 && n_B[en_ID] <= 120 )
	{ // Kobolds
		specialRacialMod = n_tok[bon_DMG_KOBOLD];
	}
	if ( ( n_B[en_ID] >= 49 && n_B[en_ID] <= 52 ) || n_B[en_ID] === 55 || n_B[en_ID] === 221 )
	{ // Orc
		specialRacialMod = n_tok[bon_DMG_ORC];
	}
	if ( n_B[en_ID] === 106 || n_B[en_ID] === 152 ||
		 n_B[en_ID] === 308 || n_B[en_ID] === 32  ||
		 n_B[en_ID] === 541 )
	{ // Golem
		specialRacialMod = n_tok[bon_DMG_GOLEM];
	}
}

function CalcSizeMod()
{
	sizeMod = 0;

	if ( EquipNumSearch( 1487 ) || EquipNumSearch( 1488 ) )
	{ // "RWC Memory Knife or RWC Memory Mace"
		if (n_A_Weapon_ATKplus >= 6) { n_tok[bon_DMG_SIZ_SMALL] += 5; n_tok[bon_DMG_SIZ_MEDIUM] += 5; n_tok[bon_DMG_SIZ_LARGE] += 5; }
		if (n_A_Weapon_ATKplus >= 9) { n_tok[bon_DMG_SIZ_SMALL] += 5; n_tok[bon_DMG_SIZ_MEDIUM] += 5; n_tok[bon_DMG_SIZ_LARGE] += 5; }
	}

	sizeMod = n_tok[bon_DMG_SIZ_SMALL + n_B[en_SIZE]];
	if ( monsterBuffs[status_en_buff_Size] )
	{ // Size Reduction
		sizeMod -= monsterBuffs[status_en_buff_Size];
	}
}

function CalcBossMod()
{
	bossMod = 0;

	if ( SU_STR >= 120 && EquipNumSearch( 348 ) )
	{ // Megingjard
		n_tok[bon_DMG_BOSS] += 10;
	}
	if(EquipNumSearch(1513))
	{//Lord of the Dead Helm
		if (n_A_HEAD_DEF_PLUS >= 5) n_tok[bon_DMG_BOSS] += n_A_HEAD_DEF_PLUS-5;
		if (CardNumSearch(31)) n_tok[bon_DMG_BOSS] += 5;
	}

	if ( n_B[en_BOSS] === 1 )
	{
		bossMod = n_tok[bon_DMG_BOSS];
	}
}

function CalcAttackMod()
{
	// Attack Mod is physical mod *
	attackMod = 1;

	// Equipment
	if ( n_A_JobSearch2() === cls_ROG && CardNumSearch( 479 ) )
	{ // Byrogue Card
		n_tok[bon_PHY_ATK] += 10;
	}
	if ( EquipNumSearch( 1401 ) && n_A_JobSearch2()==cls_SWO || n_A_JobSearch2()==cls_THI || n_A_JobSearch2()==cls_MER ) {
		n_tok[bon_PHY_ATK] += 8;
	}
	if ( EquipNumSearch( 992 ) &&
		 ( EquipNumSearch( 616 ) ||
		   EquipNumSearch( 617 ) ||
		   EquipNumSearch( 618 ) ) )
	{ // Tournament Shield with Long Horn/Battle Hook/Hunting Spear
		n_tok[bon_PHY_ATK] += 4;
	}
	if ( n_A_Weapon_ATKplus >= 9 && EquipNumSearch( 1101 ) )
	{ // Glorious Gatling Gun
		n_tok[bon_PHY_ATK] += n_A_Weapon_ATKplus;
	}
	if ( EquipNumSearch( 565 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Dress Hat
		n_tok[bon_PHY_ATK] += 1;
	}
	if ( EquipNumSearch( 1214 ) )
	{ // Red Wing Hat
		if ( n_A_HEAD_DEF_PLUS >= 7 )
		{
			n_tok[bon_PHY_ATK] += 2;
		}
		if ( n_A_HEAD_DEF_PLUS >= 9 )
		{
			n_tok[bon_PHY_ATK] += 2;
		}
	}
	if ( EquipNumSearch( 1342 ) && n_A_HEAD_DEF_PLUS >= 9 )
	{ // Libra Diadem
		n_tok[bon_PHY_ATK] += 3;
	}
	if(EquipNumSearch(1514))
	{//Evil Marching Hat
		if (n_A_HEAD_DEF_PLUS >= 9) n_tok[bon_PHY_ATK] += 5;
	}

	attackMod *= ( 100 + n_tok[bon_PHY_ATK] ) / 100;

	var cardnEquipBonus = StPlusCalc2( bon_DMG_MONSTER+n_B[en_ID] ) + StPlusCard( bon_DMG_MONSTER+n_B[en_ID] );
	attackMod *= ( 100 + cardnEquipBonus ) / 100;

	// Skills
	if ( SkillSearch( skill_LK_FRENZY ) )
	{
		attackMod *= 2;
	}
	if ( n_A_WeaponType === weapTyp_KATAR && SkillSearch( skill_AX_ADVANCED_KATAR_MASTERY ) )
	{
		attackMod *= ( 110 + 2 * SkillSearch( skill_AX_ADVANCED_KATAR_MASTERY ) ) / 100;
	}
	var multiplier = 0;
	if ( SkillSearch(skill_TKM_STELLAR_WRATH) && SkillSearch(skill_TKM_SOLAR_LUNAR_AND_STELLAR_MIRACLE ) )
	{
		multiplier = ( n_A_BaseLV + n_A_STR + n_A_LUK + n_A_DEX ) / ( 12 - SkillSearch( skill_TKM_STELLAR_WRATH ) * 3 );
	}
	else if ( SkillSearch( skill_TKM_STELLAR_WRATH ) && n_B[en_SIZE] == 2 && n_B[en_HP] >= 17392 )
	{
		multiplier = ( n_A_BaseLV + n_A_STR + n_A_LUK + n_A_DEX ) / ( 12 - SkillSearch( skill_TKM_STELLAR_WRATH ) * 3 );
	}
	else if ( SkillSearch( skill_TKM_SOLAR_WRATH ) && n_B[en_SIZE] == 0 )
	{
		multiplier = ( n_A_BaseLV + n_A_LUK + n_A_DEX ) / ( 12 - SkillSearch( skill_TKM_SOLAR_WRATH ) * 3 );
	}
	else if ( SkillSearch( skill_TKM_LUNAR_WRATH ) && n_B[en_SIZE] == 1 && n_B[en_HP] >= 5218 )
	{
		multiplier = ( n_A_BaseLV + n_A_LUK + n_A_DEX ) / ( 12 - SkillSearch( skill_TKM_LUNAR_WRATH ) * 3 );
	}

	attackMod *= ( 100 + multiplier ) / 100;
}

function CalcCriticalMod()
{
	criticalMod = 0;

	// Critical
	if ( EquipNumSearch( 1089 ) )
	{ // Glorious Hunter Bow
		n_tok[bon_DMG_CRIT] += ( 2 * n_A_Weapon_ATKplus );
	}
	if ( EquipNumSearch( 1305 ) && n_A_Arrow == arrTyp_SHARP )
	{ // Little Feather Hat + Sharp Arrows
		n_tok[bon_DMG_CRIT] += 5;
		if ( n_A_HEAD_DEF_PLUS >= 7 )
		{
			n_tok[bon_DMG_CRIT] += 5;
		}
	}

	// Pets
	if ( miscEffects[ksPetEffects] == 22 )
	{ // Dullahan Pet
		n_tok[bon_DMG_CRIT] += 5;
	}

	criticalMod = n_tok[bon_DMG_CRIT];
}

function CalcRangedMod()
{
	// Calc Ranged bonuses
	rangedMod = 0;

	// Equipment
	if ( EquipNumSearch( 626 ) && n_A_Arrow == arrTyp_FIRE )
	{ // Burning Bow
		n_tok[bon_DMG_RANGE] += 25;
	}
	else if ( EquipNumSearch( 627 ) && n_A_Arrow == arrTyp_CRYSTAL )
	{ // Freezing Bow
		n_tok[bon_DMG_RANGE] += 25;
	}
	else if ( EquipNumSearch( 628 ) && n_A_Arrow == arrTyp_STONE )
	{ // Earthen Bow
		n_tok[bon_DMG_RANGE] += 25;
	}
	else if ( EquipNumSearch( 629 ) && n_A_Arrow == arrTyp_WIND )
	{ // Gale Bow
		n_tok[bon_DMG_RANGE] += 25;
	}
	else if ( EquipNumSearch( 630 ) && n_A_Arrow == arrTyp_STEEL )
	{ // Orc Archer Bow
		n_tok[bon_DMG_RANGE] += 50;
	}
	else if ( EquipNumSearch( 1286 ) && n_A_Arrow == arrTyp_ELVEN )
	{ // Elven Bow
		n_tok[bon_DMG_RANGE] += 50;
	}
	else if ( EquipNumSearch( 101 ) && n_A_Arrow == arrTyp_HUNTING )
	{ // Hunter Bow
		n_tok[bon_DMG_RANGE] += 50;
	}
	if ( EquipNumSearch( 1255 ) && SU_AGI >= 120 )
	{ // Sniper Googles
		n_tok[bon_DMG_RANGE] += 4;
	}
	if ( EquipNumSearch( 1265 ) )
	{ // Dying Swan
		n_tok[bon_DMG_RANGE] += 5;
	}
	if ( EquipNumSearch( 1258 ) )
	{ // Maestro Song Hat
		n_tok[bon_DMG_RANGE] += 5;
	}
	if ( EquipNumSearch( 1217 ) )
	{ // Captain's Hat and pipe? Not in iRO
		n_tok[bon_DMG_RANGE] += n_A_HEAD_DEF_PLUS;
	}
	if ( EquipNumSearch( 1354 ) && n_A_HEAD_DEF_PLUS >= 9 )
	{ // Sagittarius Crown
		n_tok[bon_DMG_RANGE] += 3;
	}
	if ( EquipNumSearch( 1401 ) && n_A_JobSearch()==cls_ARC )
	{ // Ancient Gold Ornament
		n_tok[bon_DMG_RANGE] += 10;
	}
	if ( EquipNumSearch( 1408 ) )
	{ // White Wing Suit
		n_tok[bon_DMG_RANGE] += 2*n_A_BODY_DEF_PLUS;
	}
	if(EquipNumSearch(1514))
	{//Evil Marching Hat
		if (n_A_HEAD_DEF_PLUS >= 9)
		    n_tok[bon_DMG_RANGE] += 5;
	}
	if (SkillSearch(skill_RAN_NO_LIMITS)) {
		n_tok[bon_DMG_RANGE] += 50 * SkillSearch(skill_RAN_NO_LIMITS);
	}
	if (not_use_card == 1)
	rangedMod = 0;
	else
	rangedMod = n_tok[bon_DMG_RANGE];
	if ( monsterBuffs[status_en_buff_Ranged] )
	{ // Ranged Reduction
		rangedMod -= monsterBuffs[status_en_buff_Ranged];
	}
}

function CalcWeaponSizeMod()
{
	// Calc Weapon Size Mod
	weaponSizeMod = weaponsize[n_A_WeaponType][n_B[en_SIZE]];
	if ( n_Nitou )
	{ // Dual Hand
		weapon2SizeMod = weaponsize[n_A_Weapon2Type][n_B[en_SIZE]];
	}

	// Skills
	if( SkillSearch( skill_KN_CAVALIER_MASTERY ) || SkillSearch( skill_RUN_DRAGON_TRAINING ) )
	{
		if ( ( n_A_WeaponType === weapTyp_SPEAR ||
			   n_A_WeaponType === weapTyp_2HSPEAR ) &&
			 n_B[en_SIZE] === siz_MEDIUM )
		{
			// spears do 100% damage to
			// medium monsters while on a mount
			weaponSizeMod = 1;
		}
	}
	if ( SkillSearch( skill_BS_WEAPON_PERFECTION ) || otherBuffs[ksWeaponPerfection] )
	{ // Weapon Perfection gives perfect size mod
		weaponSizeMod = 1;
		weapon2SizeMod = 1;
	}

	// Cards
	for ( var i = 0; i < 8; i++ )
	{
		if ( cardOBJ[n_A_card[i]][0] == 32 )
		{ // Drake card
			weaponSizeMod = 1;
			weapon2SizeMod = 1;
		}
	}

	// Equipment
	if ( EquipNumSearch( 1177 ) )
	{ // Large Orc Hero Helm
		weaponSizeMod = 1;
		weapon2SizeMod = 1;
	}
}

{
JobHP_A = new Array(0,70,50,40,50,30,40,150,110,75,85,55,90,110,85, 90,75,75,75,90,0,150,110,75,85,55,90,110,85, 90,75,75,75,90,0,70,50,40,50,30,40,70, 90,75,  80,75,150,150,110,110,75,75,85,85,55,55,90,90,110,110,85,85, 90, 90,75,75,75,75,75,75,90,90,0,0);
JobHP_B = new Array(5, 5, 5, 5, 5, 5, 5,  5,  5, 5, 5, 5, 5,  7, 5,6.5, 3, 3, 5, 5,5,  5,  5, 5, 5, 5, 5,  7, 5,6.5, 3, 3, 5, 5,5, 5, 5, 5, 5, 5, 5, 5,6.5, 5,2.59, 0,  5,  5,  5,  5, 5, 5, 5, 5, 5, 5, 5, 5,  7,  7, 5, 5,6.5,6.5, 3, 3, 3, 3, 5, 5, 5, 5,5,5);
JobHP_Third = [
/* RK */[8100,8133,8242,8352,8464,8576,8690,8804,8920,9036,9154,9273,9393,9514,9636,9759,9883,10008,10134,10261,10389,10518,10648,10779,10912,11045,11180,11315,11452,11589,11728,11868,12009,12151,12294,12438,12583,12729,12876,13024,13173,13323,13474,13626,13780,13934,14090,14246,14404,14562,14722,14883,15042,15100,15260,15321,15481,15541,15600,15760,15820,15980,16141,16303,16466,16630,16795,16961,17128,17296,17465,17635,17806,17978,18151,18325,18500,18675,18850,19025,19200,19375,19550,19725,19900,20075,20250,20425,20600,20775,20950,21125,21300,21475,21650,21825,22000,22175,22350,22525,22700,22875,23050,23225,23400,23575,23750,23925,24100,24275,24450,24625,24800,24975,25150,25325,25500,25675,25850,26025,26200,26375,26550,26725,26900,27075,27250,27425,27600,27775,27950,28125,28300,28475,28650,28825,29000,29175,29350,29525,29700,29875,30050,30225,30400,30575,30750,30925,31100,31275,31450,31625,31800,31975,32150,32325,32500,32675,32850,33025,33200,33375,33550,33725,33900,34075,34250,34425,34600,34775,34950,35125,35300,35475,35650,35825,36000,36175,36350,36525,36700,36875,37050,37225,37400,37575,37750,37925,38100,38275,38450,38625,38800,38975,39150,39325,39500,39675,39850,40025,40200,40375,40550,40725,40900,41075,41250,41425,41600,41775,41950,42125,42300,42475,42650,42825,43000,43175,43350,43525,43700,43875,44050,44225,44400,44575,44750,44925,45100,45275,45450,45625,45800,45975,46150,46325,46500,46675,46850,47025,47200,47375,47550,47725,47900,48075,48250,48425,48600,48775,48950,49125,49300,49475,49650,49825,50000,50175,50350,50525,50700,50875,51050,51225,51400,51575,51750,51925,52100,52275,52450,52625,52800,52975,53150,53325,53500,53675,53850,54025,54200,54375,54550,54725,54900,55075,55250,55425,55600,55775,55950,56125,56300,56475,56650,56825,57000,57175,57350,57525,57700,57875,58050,58225,58400,58575,58750,58925,59100,59275,59450,59625,59800,59975,60150,60325,60500,60675,60850,61025,61200,61375,61550,61725,61900,62075,62250,62425,62600,62775,62950,63125,63300,63475,63650,63825,64000,64175,64350,64525,64700,64875,65050,65225,65400,65575,65750,65925,66100,66275,66450,66625,66800,66975,67150,67325,67500,67675,67850,68025,68200,68375,68550,68725,68900,69075,69250,69425,69600,69775,69950,70125,70300,70475,70650,70825,71000,71175,71350,71525,71700,71875,72050,72225,72400,72575,72750,72925,73100,73275,73450,73625,73800,73975,74150,74325,74500,74675,74850,75025,75200,75375],
/* GX */[6050,6093,6208,6324,6441,6559,6678,6798,6920,7043,7167,7292,7418,7545,7673,7802,7932,8063,8196,8330,8465,8601,8738,8876,9015,9155,9296,9438,9582,9727,9873,10020,10168,10317,10467,10618,10770,10923,11078,11234,11391,11549,11708,11868,12029,12191,12354,12518,12684,12851,13019,13188,13351,13518,13684,13850,14016,14182,14349,14515,14681,14830,14966,15103,15241,15380,15520,15661,15803,15946,16090,16235,16381,16528,16676,16825,16975,17125,17275,17425,17575,17725,17875,18025,18175,18325,18475,18625,18775,18925,19075,19225,19375,19525,19675,19825,19975,20125,20275,20425,20575,20725,20875,21025,21175,21325,21475,21625,21775,21925,22075,22225,22375,22525,22675,22825,22975,23125,23275,23425,23575,23725,23875,24025,24175,24325,24475,24625,24775,24925,25075,25225,25375,25525,25675,25825,25975,26125,26275,26425,26575,26725,26875,27025,27175,27325,27475,27625,27775,27925,28075,28225,28375,28525,28675,28825,28975,29125,29275,29425,29575,29725,29875,30025,30175,30325,30475,30625,30775,30925,31075,31225,31375,31525,31675,31825,31975,32125,32275,32425,32575,32725,32875,33025,33175,33325,33475,33625,33775,33925,34075,34225,34375,34525,34675,34825,34975,35125,35275,35425,35575,35725,35875,36025,36175,36325,36475,36625,36775,36925,37075,37225,37375,37525,37675,37825,37975,38125,38275,38425,38575,38725,38875,39025,39175,39325,39475,39625,39775,39925,40075,40225,40375,40525,40675,40825,40975,41125,41275,41425,41575,41725,41875,42025,42175,42325,42475,42625,42775,42925,43075,43225,43375,43525,43675,43825,43975,44125,44275,44425,44575,44725,44875,45025,45175,45325,45475,45625,45775,45925,46075,46225,46375,46525,46675,46825,46975,47125,47275,47425,47575,47725,47875,48025,48175,48325,48475,48625,48775,48925,49075,49225,49375,49525,49675,49825,49975,50125,50275,50425,50575,50725,50875,51025,51175,51325,51475,51625,51775,51925,52075,52225,52375,52525,52675,52825,52975,53125,53275,53425,53575,53725,53875,54025,54175,54325,54475,54625,54775,54925,55075,55225,55375,55525,55675,55825,55975,56125,56275,56425,56575,56725,56875,57025,57175,57325,57475,57625,57775,57925,58075,58225,58375,58525,58675,58825,58975,59125,59275,59425,59575,59725,59875,60025,60175,60325,60475,60625,60775,60925,61075,61225,61375,61525,61675,61825,61975,62125,62275,62425,62575,62725,62875,63025,63175,63325,63475,63625,63775,63925,64075,64225,64375,64525,64675,64825,64975,65125,65275,65425,65575,65725],
/* AB */[4300,4333,4412,4491,4570,4649,4728,4807,4886,4965,5044,5123,5202,5281,5360,5439,5518,5597,5676,5755,5834,5913,5992,6071,6150,6229,6308,6387,6466,6545,6624,6703,6782,6861,6940,7019,7098,7177,7256,7335,7414,7493,7572,7651,7730,7809,7888,7967,8046,8125,8204,8283,8362,8441,8520,8599,8678,8757,8836,8915,8994,9115,9276,9438,9601,9765,9930,10096,10263,10431,10600,10770,10941,11113,11286,11460,11635,11810,11985,12160,12335,12510,12685,12860,13035,13210,13385,13560,13735,13910,14085,14260,14435,14610,14785,14960,15135,15310,15485,15660,15835,16010,16185,16360,16535,16710,16885,17060,17235,17410,17585,17760,17935,18110,18285,18460,18635,18810,18985,19160,19335,19510,19685,19860,20035,20210,20385,20560,20735,20910,21085,21260,21435,21610,21785,21960,22135,22310,22485,22660,22835,23010,23185,23360,23535,23710,23885,24060,24235,24410,24585,24760,24935,25110,25285,25460,25635,25810,25985,26160,26335,26510,26685,26860,27035,27210,27385,27560,27735,27910,28085,28260,28435,28610,28785,28960,29135,29310,29485,29660,29835,30010,30185,30360,30535,30710,30885,31060,31235,31410,31585,31760,31935,32110,32285,32460,32635,32810,32985,33160,33335,33510,33685,33860,34035,34210,34385,34560,34735,34910,35085,35260,35435,35610,35785,35960,36135,36310,36485,36660,36835,37010,37185,37360,37535,37710,37885,38060,38235,38410,38585,38760,38935,39110,39285,39460,39635,39810,39985,40160,40335,40510,40685,40860,41035,41210,41385,41560,41735,41910,42085,42260,42435,42610,42785,42960,43135,43310,43485,43660,43835,44010,44185,44360,44535,44710,44885,45060,45235,45410,45585,45760,45935,46110,46285,46460,46635,46810,46985,47160,47335,47510,47685,47860,48035,48210,48385,48560,48735,48910,49085,49260,49435,49610,49785,49960,50135,50310,50485,50660,50835,51010,51185,51360,51535,51710,51885,52060,52235,52410,52585,52760,52935,53110,53285,53460,53635,53810,53985,54160,54335,54510,54685,54860,55035,55210,55385,55560,55735,55910,56085,56260,56435,56610,56785,56960,57135,57310,57485,57660,57835,58010,58185,58360,58535,58710,58885,59060,59235,59410,59585,59760,59935,60110,60285,60460,60635,60810,60985,61160,61335,61510,61685,61860,62035,62210,62385,62560,62735,62910,63085,63260,63435,63610,63785,63960,64135,64310,64485,64660,64835,65010,65185,65360,65535,65710,65885,66060,66235,66410,66585,66760,66935,67110,67285,67460,67635,67810,67985,68160,68335,68510],
/* RA */[4800,4828,4918,5009,5101,5194,5288,5382,5477,5573,5670,5768,5867,5967,6068,6170,6273,6377,6482,6588,6694,6801,6909,7018,7128,7239,7351,7464,7578,7693,7809,7926,8044,8162,8281,8401,8522,8644,8767,8891,9016,9142,9269,9397,9526,9656,9786,9917,10049,10182,10316,10451,10585,10719,10853,10987,11121,11255,11389,11523,11657,11790,11926,12063,12201,12340,12480,12621,12763,12906,13050,13195,13341,13488,13636,13785,13935,14085,14235,14385,14535,14685,14835,14985,15135,15285,15435,15585,15735,15885,16035,16185,16335,16485,16635,16785,16935,17085,17235,17385,17535,17685,17835,17985,18135,18285,18435,18585,18735,18885,19035,19185,19335,19485,19635,19785,19935,20085,20235,20385,20535,20685,20835,20985,21135,21285,21435,21585,21735,21885,22035,22185,22335,22485,22635,22785,22935,23085,23235,23385,23535,23685,23835,23985,24135,24285,24435,24585,24735,24885,25035,25185,25335,25485,25635,25785,25935,26085,26235,26385,26535,26685,26835,26985,27135,27285,27435,27585,27735,27885,28035,28185,28335,28485,28635,28785,28935,29085,29235,29385,29535,29685,29835,29985,30135,30285,30435,30585,30735,30885,31035,31185,31335,31485,31635,31785,31935,32085,32235,32385,32535,32685,32835,32985,33135,33285,33435,33585,33735,33885,34035,34185,34335,34485,34635,34785,34935,35085,35235,35385,35535,35685,35835,35985,36135,36285,36435,36585,36735,36885,37035,37185,37335,37485,37635,37785,37935,38085,38235,38385,38535,38685,38835,38985,39135,39285,39435,39585,39735,39885,40035,40185,40335,40485,40635,40785,40935,41085,41235,41385,41535,41685,41835,41985,42135,42285,42435,42585,42735,42885,43035,43185,43335,43485,43635,43785,43935,44085,44235,44385,44535,44685,44835,44985,45135,45285,45435,45585,45735,45885,46035,46185,46335,46485,46635,46785,46935,47085,47235,47385,47535,47685,47835,47985,48135,48285,48435,48585,48735,48885,49035,49185,49335,49485,49635,49785,49935,50085,50235,50385,50535,50685,50835,50985,51135,51285,51435,51585,51735,51885,52035,52185,52335,52485,52635,52785,52935,53085,53235,53385,53535,53685,53835,53985,54135,54285,54435,54585,54735,54885,55035,55185,55335,55485,55635,55785,55935,56085,56235,56385,56535,56685,56835,56985,57135,57285,57435,57585,57735,57885,58035,58185,58335,58485,58635,58785,58935,59085,59235,59385,59535,59685,59835,59985,60135,60285,60435,60585,60735,60885,61035,61185,61335,61485,61635,61785,61935,62085,62235,62385,62535,62685],
/* WL */[3200,3313,3383,3455,3528,3601,3675,3749,3824,3899,3975,4051,4129,4208,4287,4367,4447,4528,4609,4691,4773,4857,4941,5026,5112,5198,5285,5372,5460,5548,5638,5728,5819,5911,6003,6096,6189,6283,6377,6473,6569,6666,6763,6861,6960,7059,7159,7259,7361,7463,7566,7669,7771,7874,7976,8079,8181,8284,8386,8489,8591,8730,8891,9053,9216,9380,9545,9711,9878,10046,10215,10385,10556,10728,10901,11075,11250,11425,11600,11775,11950,12125,12300,12475,12650,12825,13000,13175,13350,13525,13700,13875,14050,14225,14400,14575,14750,14925,15100,15275,15450,15625,15800,15975,16150,16325,16500,16675,16850,17025,17200,17375,17550,17725,17900,18075,18250,18425,18600,18775,18950,19125,19300,19475,19650,19825,20000,20175,20350,20525,20700,20875,21050,21225,21400,21575,21750,21925,22100,22275,22450,22625,22800,22975,23150,23325,23500,23675,23850,24025,24200,24375,24550,24725,24900,25075,25250,25425,25600,25775,25950,26125,26300,26475,26650,26825,27000,27175,27350,27525,27700,27875,28050,28225,28400,28575,28750,28925,29100,29275,29450,29625,29800,29975,30150,30325,30500,30675,30850,31025,31200,31375,31550,31725,31900,32075,32250,32425,32600,32775,32950,33125,33300,33475,33650,33825,34000,34175,34350,34525,34700,34875,35050,35225,35400,35575,35750,35925,36100,36275,36450,36625,36800,36975,37150,37325,37500,37675,37850,38025,38200,38375,38550,38725,38900,39075,39250,39425,39600,39775,39950,40125,40300,40475,40650,40825,41000,41175,41350,41525,41700,41875,42050,42225,42400,42575,42750,42925,43100,43275,43450,43625,43800,43975,44150,44325,44500,44675,44850,45025,45200,45375,45550,45725,45900,46075,46250,46425,46600,46775,46950,47125,47300,47475,47650,47825,48000,48175,48350,48525,48700,48875,49050,49225,49400,49575,49750,49925,50100,50275,50450,50625,50800,50975,51150,51325,51500,51675,51850,52025,52200,52375,52550,52725,52900,53075,53250,53425,53600,53775,53950,54125,54300,54475,54650,54825,55000,55175,55350,55525,55700,55875,56050,56225,56400,56575,56750,56925,57100,57275,57450,57625,57800,57975,58150,58325,58500,58675,58850,59025,59200,59375,59550,59725,59900,60075,60250,60425,60600,60775,60950,61125,61300,61475,61650,61825,62000,62175,62350,62525,62700,62875,63050,63225,63400,63575,63750,63925,64100,64275,64450,64625,64800,64975,65150,65325,65500,65675,65850,66025,66200,66375,66550,66725,66900,67075,67250,67425,67600,67775,67950,68125],
/* ME */[5807,5844,5952,6061,6172,6283,6396,6510,6625,6741,6857,6974,7093,7212,7333,7455,7578,7702,7828,7954,8081,8208,8337,8467,8598,8730,8864,8998,9134,9271,9408,9546,9685,9825,9967,10109,10253,10398,10544,10691,10838,10987,11136,11287,11439,11592,11746,11901,12057,12215,12372,12531,12688,12845,13003,13160,13318,13475,13633,13790,13948,14105,14266,14428,14591,14755,14920,15086,15253,15421,15590,15760,15931,16103,16276,16450,16625,16800,16975,17150,17325,17500,17675,17850,18025,18200,18375,18550,18725,18900,19075,19250,19425,19600,19775,19950,20125,20300,20475,20650,20825,21000,21175,21350,21525,21700,21875,22050,22225,22400,22575,22750,22925,23100,23275,23450,23625,23800,23975,24150,24325,24500,24675,24850,25025,25200,25375,25550,25725,25900,26075,26250,26425,26600,26775,26950,27125,27300,27475,27650,27825,28000,28175,28350,28525,28700,28875,29050,29225,29400,29575,29750,29925,30100,30275,30450,30625,30800,30975,31150,31325,31500,31675,31850,32025,32200,32375,32550,32725,32900,33075,33250,33425,33600,33775,33950,34125,34300,34475,34650,34825,35000,35175,35350,35525,35700,35875,36050,36225,36400,36575,36750,36925,37100,37275,37450,37625,37800,37975,38150,38325,38500,38675,38850,39025,39200,39375,39550,39725,39900,40075,40250,40425,40600,40775,40950,41125,41300,41475,41650,41825,42000,42175,42350,42525,42700,42875,43050,43225,43400,43575,43750,43925,44100,44275,44450,44625,44800,44975,45150,45325,45500,45675,45850,46025,46200,46375,46550,46725,46900,47075,47250,47425,47600,47775,47950,48125,48300,48475,48650,48825,49000,49175,49350,49525,49700,49875,50050,50225,50400,50575,50750,50925,51100,51275,51450,51625,51800,51975,52150,52325,52500,52675,52850,53025,53200,53375,53550,53725,53900,54075,54250,54425,54600,54775,54950,55125,55300,55475,55650,55825,56000,56175,56350,56525,56700,56875,57050,57225,57400,57575,57750,57925,58100,58275,58450,58625,58800,58975,59150,59325,59500,59675,59850,60025,60200,60375,60550,60725,60900,61075,61250,61425,61600,61775,61950,62125,62300,62475,62650,62825,63000,63175,63350,63525,63700,63875,64050,64225,64400,64575,64750,64925,65100,65275,65450,65625,65800,65975,66150,66325,66500,66675,66850,67025,67200,67375,67550,67725,67900,68075,68250,68425,68600,68775,68950,69125,69300,69475,69650,69825,70000,70175,70350,70525,70700,70875,71050,71225,71400,71575,71750,71925,72100,72275,72450,72625,72800,72975,73150,73325,73500],
/* RG */[6050,6093,6208,6324,6441,6559,6678,6798,6920,7043,7167,7292,7418,7545,7673,7802,7932,8063,8196,8330,8465,8601,8738,8876,9015,9155,9296,9438,9582,9727,9873,10020,10168,10317,10467,10618,10770,10923,11078,11234,11391,11549,11708,11868,12029,12191,12354,12518,12684,12851,13019,13188,13355,13522,13690,13857,14025,14192,14360,14527,14695,14860,15021,15183,15346,15510,15675,15841,16008,16176,16345,16515,16686,16858,17031,17205,17380,17555,17730,17905,18080,18255,18430,18605,18780,18955,19130,19305,19480,19655,19830,20005,20180,20355,20530,20705,20880,21055,21230,21405,21580,21755,21930,22105,22280,22455,22630,22805,22980,23155,23330,23505,23680,23855,24030,24205,24380,24555,24730,24905,25080,25255,25430,25605,25780,25955,26130,26305,26480,26655,26830,27005,27180,27355,27530,27705,27880,28055,28230,28405,28580,28755,28930,29105,29280,29455,29630,29805,29980,30155,30330,30505,30680,30855,31030,31205,31380,31555,31730,31905,32080,32255,32430,32605,32780,32955,33130,33305,33480,33655,33830,34005,34180,34355,34530,34705,34880,35055,35230,35405,35580,35755,35930,36105,36280,36455,36630,36805,36980,37155,37330,37505,37680,37855,38030,38205,38380,38555,38730,38905,39080,39255,39430,39605,39780,39955,40130,40305,40480,40655,40830,41005,41180,41355,41530,41705,41880,42055,42230,42405,42580,42755,42930,43105,43280,43455,43630,43805,43980,44155,44330,44505,44680,44855,45030,45205,45380,45555,45730,45905,46080,46255,46430,46605,46780,46955,47130,47305,47480,47655,47830,48005,48180,48355,48530,48705,48880,49055,49230,49405,49580,49755,49930,50105,50280,50455,50630,50805,50980,51155,51330,51505,51680,51855,52030,52205,52380,52555,52730,52905,53080,53255,53430,53605,53780,53955,54130,54305,54480,54655,54830,55005,55180,55355,55530,55705,55880,56055,56230,56405,56580,56755,56930,57105,57280,57455,57630,57805,57980,58155,58330,58505,58680,58855,59030,59205,59380,59555,59730,59905,60080,60255,60430,60605,60780,60955,61130,61305,61480,61655,61830,62005,62180,62355,62530,62705,62880,63055,63230,63405,63580,63755,63930,64105,64280,64455,64630,64805,64980,65155,65330,65505,65680,65855,66030,66205,66380,66555,66730,66905,67080,67255,67430,67605,67780,67955,68130,68305,68480,68655,68830,69005,69180,69355,69530,69705,69880,70055,70230,70405,70580,70755,70930,71105,71280,71455,71630,71805,71980,72155,72330,72505,72680,72855,73030,73205,73380,73555,73730,73905,74080,74255],
/* SC */[6050,6093,6208,6324,6441,6559,6678,6798,6920,7043,7167,7292,7418,7545,7673,7802,7932,8063,8196,8330,8465,8601,8738,8876,9015,9155,9296,9438,9582,9727,9873,10020,10168,10317,10467,10618,10770,10923,11078,11234,11391,11549,11708,11868,12029,12191,12354,12518,12684,12851,13019,13188,13300,13420,13500,13600,13700,13800,13900,14000,14100,14200,14301,14403,14506,14610,14715,14821,14928,15036,15145,15255,15366,15478,15591,15705,15820,15935,16050,16165,16280,16395,16510,16625,16740,16855,16970,17085,17200,17315,17430,17545,17660,17775,17890,18005,18120,18235,18350,18465,18580,18695,18810,18925,19040,19155,19270,19385,19500,19615,19730,19845,19960,20075,20190,20305,20420,20535,20650,20765,20880,20995,21110,21225,21340,21455,21570,21685,21800,21915,22030,22145,22260,22375,22490,22605,22720,22835,22950,23065,23180,23295,23410,23525,23640,23755,23870,23985,24100,24215,24330,24445,24560,24675,24790,24905,25020,25135,25250,25365,25480,25595,25710,25825,25940,26055,26170,26285,26400,26515,26630,26745,26860,26975,27090,27205,27320,27435,27550,27665,27780,27895,28010,28125,28240,28355,28470,28585,28700,28815,28930,29045,29160,29275,29390,29505,29620,29735,29850,29965,30080,30195,30310,30425,30540,30655,30770,30885,31000,31115,31230,31345,31460,31575,31690,31805,31920,32035,32150,32265,32380,32495,32610,32725,32840,32955,33070,33185,33300,33415,33530,33645,33760,33875,33990,34105,34220,34335,34450,34565,34680,34795,34910,35025,35140,35255,35370,35485,35600,35715,35830,35945,36060,36175,36290,36405,36520,36635,36750,36865,36980,37095,37210,37325,37440,37555,37670,37785,37900,38015,38130,38245,38360,38475,38590,38705,38820,38935,39050,39165,39280,39395,39510,39625,39740,39855,39970,40085,40200,40315,40430,40545,40660,40775,40890,41005,41120,41235,41350,41465,41580,41695,41810,41925,42040,42155,42270,42385,42500,42615,42730,42845,42960,43075,43190,43305,43420,43535,43650,43765,43880,43995,44110,44225,44340,44455,44570,44685,44800,44915,45030,45145,45260,45375,45490,45605,45720,45835,45950,46065,46180,46295,46410,46525,46640,46755,46870,46985,47100,47215,47330,47445,47560,47675,47790,47905,48020,48135,48250,48365,48480,48595,48710,48825,48940,49055,49170,49285,49400,49515,49630,49745,49860,49975,50090,50205,50320,50435,50550,50665,50780,50895,51010,51125,51240,51355,51470,51585,51700,51815,51930,52045,52160,52275,52390,52505,52620,52735,52850,52965,53080,53195],
/* SU */[5050,5082,5176,5271,5367,5464,5562,5661,5761,5862,5963,6065,6168,6272,6377,6483,6590,6698,6807,6917,7027,7138,7250,7363,7477,7592,7708,7825,7943,8062,8181,8301,8422,8544,8667,8791,8916,9042,9169,9297,9425,9554,9684,9815,9947,10080,10214,10349,10485,10622,10759,10897,11033,11170,11307,11444,11581,11718,11855,11992,12129,12265,12406,12548,12691,12835,12980,13126,13273,13421,13570,13720,13871,14023,14176,14330,14485,14640,14795,14950,15105,15260,15415,15570,15725,15880,16035,16190,16345,16500,16655,16810,16965,17120,17275,17430,17585,17740,17895,18050,18205,18360,18515,18670,18825,18980,19135,19290,19445,19600,19755,19910,20065,20220,20375,20530,20685,20840,20995,21150,21305,21460,21615,21770,21925,22080,22235,22390,22545,22700,22855,23010,23165,23320,23475,23630,23785,23940,24095,24250,24405,24560,24715,24870,25025,25180,25335,25490,25645,25800,25955,26110,26265,26420,26575,26730,26885,27040,27195,27350,27505,27660,27815,27970,28125,28280,28435,28590,28745,28900,29055,29210,29365,29520,29675,29830,29985,30140,30295,30450,30605,30760,30915,31070,31225,31380,31535,31690,31845,32000,32155,32310,32465,32620,32775,32930,33085,33240,33395,33550,33705,33860,34015,34170,34325,34480,34635,34790,34945,35100,35255,35410,35565,35720,35875,36030,36185,36340,36495,36650,36805,36960,37115,37270,37425,37580,37735,37890,38045,38200,38355,38510,38665,38820,38975,39130,39285,39440,39595,39750,39905,40060,40215,40370,40525,40680,40835,40990,41145,41300,41455,41610,41765,41920,42075,42230,42385,42540,42695,42850,43005,43160,43315,43470,43625,43780,43935,44090,44245,44400,44555,44710,44865,45020,45175,45330,45485,45640,45795,45950,46105,46260,46415,46570,46725,46880,47035,47190,47345,47500,47655,47810,47965,48120,48275,48430,48585,48740,48895,49050,49205,49360,49515,49670,49825,49980,50135,50290,50445,50600,50755,50910,51065,51220,51375,51530,51685,51840,51995,52150,52305,52460,52615,52770,52925,53080,53235,53390,53545,53700,53855,54010,54165,54320,54475,54630,54785,54940,55095,55250,55405,55560,55715,55870,56025,56180,56335,56490,56645,56800,56955,57110,57265,57420,57575,57730,57885,58040,58195,58350,58505,58660,58815,58970,59125,59280,59435,59590,59745,59900,60055,60210,60365,60520,60675,60830,60985,61140,61295,61450,61605,61760,61915,62070,62225,62380,62535,62690,62845,63000,63155,63310,63465,63620,63775,63930,64085,64240,64395,64550,64705,64860],
/* MI */[4800,4828,4918,5009,5101,5194,5288,5382,5477,5573,5670,5768,5867,5967,6068,6170,6273,6377,6482,6588,6694,6801,6909,7018,7128,7239,7351,7464,7578,7693,7809,7926,8044,8162,8281,8401,8522,8644,8767,8891,9016,9142,9269,9397,9526,9656,9786,9917,10049,10182,10316,10451,10584,10717,10851,10984,11118,11251,11385,11518,11652,11785,11921,12058,12196,12335,12475,12616,12758,12901,13045,13190,13336,13483,13631,13780,13930,14080,14230,14380,14530,14680,14830,14980,15130,15280,15430,15580,15730,15880,16030,16180,16330,16480,16630,16780,16930,17080,17230,17380,17530,17680,17830,17980,18130,18280,18430,18580,18730,18880,19030,19180,19330,19480,19630,19780,19930,20080,20230,20380,20530,20680,20830,20980,21130,21280,21430,21580,21730,21880,22030,22180,22330,22480,22630,22780,22930,23080,23230,23380,23530,23680,23830,23980,24130,24280,24430,24580,24730,24880,25030,25180,25330,25480,25630,25780,25930,26080,26230,26380,26530,26680,26830,26980,27130,27280,27430,27580,27730,27880,28030,28180,28330,28480,28630,28780,28930,29080,29230,29380,29530,29680,29830,29980,30130,30280,30430,30580,30730,30880,31030,31180,31330,31480,31630,31780,31930,32080,32230,32380,32530,32680,32830,32980,33130,33280,33430,33580,33730,33880,34030,34180,34330,34480,34630,34780,34930,35080,35230,35380,35530,35680,35830,35980,36130,36280,36430,36580,36730,36880,37030,37180,37330,37480,37630,37780,37930,38080,38230,38380,38530,38680,38830,38980,39130,39280,39430,39580,39730,39880,40030,40180,40330,40480,40630,40780,40930,41080,41230,41380,41530,41680,41830,41980,42130,42280,42430,42580,42730,42880,43030,43180,43330,43480,43630,43780,43930,44080,44230,44380,44530,44680,44830,44980,45130,45280,45430,45580,45730,45880,46030,46180,46330,46480,46630,46780,46930,47080,47230,47380,47530,47680,47830,47980,48130,48280,48430,48580,48730,48880,49030,49180,49330,49480,49630,49780,49930,50080,50230,50380,50530,50680,50830,50980,51130,51280,51430,51580,51730,51880,52030,52180,52330,52480,52630,52780,52930,53080,53230,53380,53530,53680,53830,53980,54130,54280,54430,54580,54730,54880,55030,55180,55330,55480,55630,55780,55930,56080,56230,56380,56530,56680,56830,56980,57130,57280,57430,57580,57730,57880,58030,58180,58330,58480,58630,58780,58930,59080,59230,59380,59530,59680,59830,59980,60130,60280,60430,60580,60730,60880,61030,61180,61330,61480,61630,61780,61930,62080,62230,62380,62530,62680],
/* WA */[4800,4828,4918,5009,5101,5194,5288,5382,5477,5573,5670,5768,5867,5967,6068,6170,6273,6377,6482,6588,6694,6801,6909,7018,7128,7239,7351,7464,7578,7693,7809,7926,8044,8162,8281,8401,8522,8644,8767,8891,9016,9142,9269,9397,9526,9656,9786,9917,10049,10182,10316,10451,10584,10717,10851,10984,11118,11251,11385,11518,11652,11785,11921,12058,12196,12335,12475,12616,12758,12901,13045,13190,13336,13483,13631,13780,13930,14080,14230,14380,14530,14680,14830,14980,15130,15280,15430,15580,15730,15880,16030,16180,16330,16480,16630,16780,16930,17080,17230,17380,17530,17680,17830,17980,18130,18280,18430,18580,18730,18880,19030,19180,19330,19480,19630,19780,19930,20080,20230,20380,20530,20680,20830,20980,21130,21280,21430,21580,21730,21880,22030,22180,22330,22480,22630,22780,22930,23080,23230,23380,23530,23680,23830,23980,24130,24280,24430,24580,24730,24880,25030,25180,25330,25480,25630,25780,25930,26080,26230,26380,26530,26680,26830,26980,27130,27280,27430,27580,27730,27880,28030,28180,28330,28480,28630,28780,28930,29080,29230,29380,29530,29680,29830,29980,30130,30280,30430,30580,30730,30880,31030,31180,31330,31480,31630,31780,31930,32080,32230,32380,32530,32680,32830,32980,33130,33280,33430,33580,33730,33880,34030,34180,34330,34480,34630,34780,34930,35080,35230,35380,35530,35680,35830,35980,36130,36280,36430,36580,36730,36880,37030,37180,37330,37480,37630,37780,37930,38080,38230,38380,38530,38680,38830,38980,39130,39280,39430,39580,39730,39880,40030,40180,40330,40480,40630,40780,40930,41080,41230,41380,41530,41680,41830,41980,42130,42280,42430,42580,42730,42880,43030,43180,43330,43480,43630,43780,43930,44080,44230,44380,44530,44680,44830,44980,45130,45280,45430,45580,45730,45880,46030,46180,46330,46480,46630,46780,46930,47080,47230,47380,47530,47680,47830,47980,48130,48280,48430,48580,48730,48880,49030,49180,49330,49480,49630,49780,49930,50080,50230,50380,50530,50680,50830,50980,51130,51280,51430,51580,51730,51880,52030,52180,52330,52480,52630,52780,52930,53080,53230,53380,53530,53680,53830,53980,54130,54280,54430,54580,54730,54880,55030,55180,55330,55480,55630,55780,55930,56080,56230,56380,56530,56680,56830,56980,57130,57280,57430,57580,57730,57880,58030,58180,58330,58480,58630,58780,58930,59080,59230,59380,59530,59680,59830,59980,60130,60280,60430,60580,60730,60880,61030,61180,61330,61480,61630,61780,61930,62080,62230,62380,62530,62680],
/* SO */[4080,4103,4180,4257,4335,4414,4494,4574,4655,4737,4819,4902,4986,5071,5157,5244,5332,5420,5509,5599,5689,5780,5872,5965,6058,6153,6248,6344,6441,6539,6637,6737,6837,6937,7038,7140,7243,7347,7451,7557,7663,7770,7878,7987,8097,8207,8318,8429,8541,8654,8768,8883,8994,9107,9220,9280,9340,9450,9570,9680,9798,9915,10036,10158,10281,10405,10530,10656,10783,10911,11040,11170,11301,11433,11566,11700,11835,11970,12105,12240,12375,12510,12645,12780,12915,13050,13185,13320,13455,13590,13725,13860,13995,14130,14265,14400,14535,14670,14805,14940,15075,15210,15345,15480,15615,15750,15885,16020,16155,16290,16425,16560,16695,16830,16965,17100,17235,17370,17505,17640,17775,17910,18045,18180,18315,18450,18585,18720,18855,18990,19125,19260,19395,19530,19665,19800,19935,20070,20205,20340,20475,20610,20745,20880,21015,21150,21285,21420,21555,21690,21825,21960,22095,22230,22365,22500,22635,22770,22905,23040,23175,23310,23445,23580,23715,23850,23985,24120,24255,24390,24525,24660,24795,24930,25065,25200,25335,25470,25605,25740,25875,26010,26145,26280,26415,26550,26685,26820,26955,27090,27225,27360,27495,27630,27765,27900,28035,28170,28305,28440,28575,28710,28845,28980,29115,29250,29385,29520,29655,29790,29925,30060,30195,30330,30465,30600,30735,30870,31005,31140,31275,31410,31545,31680,31815,31950,32085,32220,32355,32490,32625,32760,32895,33030,33165,33300,33435,33570,33705,33840,33975,34110,34245,34380,34515,34650,34785,34920,35055,35190,35325,35460,35595,35730,35865,36000,36135,36270,36405,36540,36675,36810,36945,37080,37215,37350,37485,37620,37755,37890,38025,38160,38295,38430,38565,38700,38835,38970,39105,39240,39375,39510,39645,39780,39915,40050,40185,40320,40455,40590,40725,40860,40995,41130,41265,41400,41535,41670,41805,41940,42075,42210,42345,42480,42615,42750,42885,43020,43155,43290,43425,43560,43695,43830,43965,44100,44235,44370,44505,44640,44775,44910,45045,45180,45315,45450,45585,45720,45855,45990,46125,46260,46395,46530,46665,46800,46935,47070,47205,47340,47475,47610,47745,47880,48015,48150,48285,48420,48555,48690,48825,48960,49095,49230,49365,49500,49635,49770,49905,50040,50175,50310,50445,50580,50715,50850,50985,51120,51255,51390,51525,51660,51795,51930,52065,52200,52335,52470,52605,52740,52875,53010,53145,53280,53415,53550,53685,53820,53955,54090,54225,54360,54495,54630,54765,54900,55035,55170,55305,55440,55575,55710],
/* GE */[4730,4766,4853,4940,5027,5113,5200,5287,5374,5461,5548,5635,5722,5809,5896,5982,6069,6156,6243,6330,6417,6504,6591,6678,6765,6851,6938,7025,7112,7199,7286,7373,7460,7547,7634,7720,7807,7894,7981,8068,8155,8242,8329,8416,8503,8589,8676,8763,8850,8937,9024,9111,9198,9285,9372,9459,9546,9633,9720,9807,9894,9980,10141,10303,10466,10630,10795,10961,11128,11296,11465,11635,11806,11978,12151,12325,12500,12675,12850,13025,13200,13375,13550,13725,13900,14075,14250,14425,14600,14775,14950,15125,15300,15475,15650,15825,16000,16175,16350,16525,16700,16875,17050,17225,17400,17575,17750,17925,18100,18275,18450,18625,18800,18975,19150,19325,19500,19675,19850,20025,20200,20375,20550,20725,20900,21075,21250,21425,21600,21775,21950,22125,22300,22475,22650,22825,23000,23175,23350,23525,23700,23875,24050,24225,24400,24575,24750,24925,25100,25275,25450,25625,25800,25975,26150,26325,26500,26675,26850,27025,27200,27375,27550,27725,27900,28075,28250,28425,28600,28775,28950,29125,29300,29475,29650,29825,30000,30175,30350,30525,30700,30875,31050,31225,31400,31575,31750,31925,32100,32275,32450,32625,32800,32975,33150,33325,33500,33675,33850,34025,34200,34375,34550,34725,34900,35075,35250,35425,35600,35775,35950,36125,36300,36475,36650,36825,37000,37175,37350,37525,37700,37875,38050,38225,38400,38575,38750,38925,39100,39275,39450,39625,39800,39975,40150,40325,40500,40675,40850,41025,41200,41375,41550,41725,41900,42075,42250,42425,42600,42775,42950,43125,43300,43475,43650,43825,44000,44175,44350,44525,44700,44875,45050,45225,45400,45575,45750,45925,46100,46275,46450,46625,46800,46975,47150,47325,47500,47675,47850,48025,48200,48375,48550,48725,48900,49075,49250,49425,49600,49775,49950,50125,50300,50475,50650,50825,51000,51175,51350,51525,51700,51875,52050,52225,52400,52575,52750,52925,53100,53275,53450,53625,53800,53975,54150,54325,54500,54675,54850,55025,55200,55375,55550,55725,55900,56075,56250,56425,56600,56775,56950,57125,57300,57475,57650,57825,58000,58175,58350,58525,58700,58875,59050,59225,59400,59575,59750,59925,60100,60275,60450,60625,60800,60975,61150,61325,61500,61675,61850,62025,62200,62375,62550,62725,62900,63075,63250,63425,63600,63775,63950,64125,64300,64475,64650,64825,65000,65175,65350,65525,65700,65875,66050,66225,66400,66575,66750,66925,67100,67275,67450,67625,67800,67975,68150,68325,68500,68675,68850,69025,69200,69375],
/* KO */[4250,4305,4360,4415,4470,4525,4580,4635,4690,4745,4800,4855,4910,4965,5020,5075,5130,5185,5240,5295,5350,5405,5460,5515,5570,5625,5680,5735,5790,5845,5900,5955,6010,6065,6120,6175,6230,6285,6340,6395,6450,6505,6560,6615,6670,6725,6780,6835,6890,6945,7000,7055,7110,7265,7320,7575,7730,7985,8240,8495,8550,8705,8860,9015,9170,9325,9480,9635,9790,9945,10100,10255,10410,10565,10720,10875,11030,11185,11340,11495,11650,11805,11960,12115,12270,12425,12580,12735,12890,13045,13200,13355,13510,13665,13820,13975,14130,14285,14440,14595,14750,14905,15060,15215,15370,15525,15680,15835,15990,16145,16300,16455,16610,16765,16920,17075,17230,17385,17540,17695,17850,18005,18160,18315,18470,18625,18780,18935,19090,19245,19400,19555,19710,19865,20020,20175,20330,20485,20640,20795,20950,21105,21260,21415,21570,21725,21880,22035,22190,22345,22500,22655,22810,22965,23120,23275,23430,23585,23740,23895,24050,24205,24360,24515,24670,24825,24980,25135,25290,25445,25600,25755,25910,26065,26220,26375,26530,26685,26840,26995,27150,27305,27460,27615,27770,27925,28080,28235,28390,28545,28700,28855,29010,29165,29320,29475,29630,29785,29940,30095,30250,30405,30560,30715,30870,31025,31180,31335,31490,31645,31800,31955,32110,32265,32420,32575,32730,32885,33040,33195,33350,33505,33660,33815,33970,34125,34280,34435,34590,34745,34900,35055,35210,35365,35520,35675,35830,35985,36140,36295,36450,36605,36760,36915,37070,37225,37380,37535,37690,37845,38000,38155,38310,38465,38620,38775,38930,39085,39240,39395,39550,39705,39860,40015,40170,40325,40480,40635,40790,40945,41100,41255,41410,41565,41720,41875,42030,42185,42340,42495,42650,42805,42960,43115,43270,43425,43580,43735,43890,44045,44200,44355,44510,44665,44820,44975,45130,45285,45440,45595,45750,45905,46060,46215,46370,46525,46680,46835,46990,47145,47300,47455,47610,47765,47920,48075,48230,48385,48540,48695,48850,49005,49160,49315,49470,49625,49780,49935,50090,50245,50400,50555,50710,50865,51020,51175,51330,51485,51640,51795,51950,52105,52260,52415,52570,52725,52880,53035,53190,53345,53500,53655,53810,53965,54120,54275,54430,54585,54740,54895,55050,55205,55360,55515,55670,55825,55980,56135,56290,56445,56600,56755,56910,57065,57220,57375,57530,57685,57840,57995,58150,58305,58460,58615,58770,58925,59080,59235,59390,59545,59700,59855,60010,60165,60320,60475,60630,60785,60940,61095,61250,61405], //Used Oboro table
/* KAG  [4250,4305,4360,4415,4470,4525,4580,4635,4690,4745,4800,4855,4910,4965,5020,5075,5130,5185,5240,5295,5350,5405,5460,5515,5570,5625,5680,5735,5790,5845,5900,5955,6010,6065,6120,6175,6230,6285,6340,6395,6450,6505,6560,6615,6670,6725,6780,6835,6890,6945,7000,7055,7210,7465,7620,7875,8330,8385,8440,8695,8850,9005],*/
/* EN */[2530,2535,2540,2545,2550,2555,2560,2565,2570,2575,2580,2585,2590,2595,2600,2605,2610,2615,2620,2625,2630,2635,2640,2645,2650,2655,2660,2665,2670,2675,2680,2685,2690,2695,2700,2705,2710,2715,2720,2725,2730,2735,2740,2745,2750,2755,2760,2765,2770,2775,2780,2785],
];
HP_COEFF = [
/* RK */
/* GX, RG, SC */
/* ME */
/* SU */
/* RA, MI, WA */
/* GE */
/* SO */
/* AB */
/* WL */

/* RK */[120,750], // original was 150, 500
/* GX */[110,500],
/* AB */[65,500],
/* RA */[85,500],
/* WL */[60,500],
/* ME */[105,500],
/* RG */[110,500],
/* SC */[110,500],
/* SU */[90,500],
/* MI */[85,500],
/* WA */[85,500],
/* SO */[70,500],
/* GE */[65,500],
/* KO */[80,0],
/* EN */[0,500]
]
}
function calcHP()
{
	n_A_MaxHP = 0;

	// Job ---
	if ( thirdClass === 0 || n_A_JOB === cls_ENOVI )
	{ // not 3rd class
		n_A_MaxHP = 0;
		for ( var i = 2; i <= n_A_BaseLV; i++ )
		{
			n_A_MaxHP += Math.round(JobHP_A[n_A_JOB] * i /100);
		}

		n_A_MaxHP = Math.floor( ( JobHP_B[n_A_JOB] * n_A_BaseLV ) + 35 + n_A_MaxHP );

		if ( n_A_JOB === cls_TKK && n_A_BaseLV >= 70 )
		{
			if ( n_A_BaseLV <=79 )
			{
				n_A_MaxHP = 2127 + 10 * (n_A_BaseLV-70);
			}
			else if ( n_A_BaseLV <=89 )
			{
				n_A_MaxHP = 2200 + 50 * (n_A_BaseLV-80);
			}
			else if ( n_A_BaseLV <= 99 )
			{
				n_A_MaxHP = 2700 + 50 * (n_A_BaseLV-90);
				if(SkillSearch(skill_TK_TAEKWON_RANKER))
					n_A_MaxHP = n_A_MaxHP * 3;
			}
		}

		if(n_A_JOB == cls_TKM && n_A_BaseLV >= 70)
		{
			// TKM HP 90~99
			wKenseiHP = [3455,3524,3593,3663,3834,3806,3878,3951,4025,4500];
			if(n_A_BaseLV <=79)
				n_A_MaxHP = 2670 + 10 * (n_A_BaseLV-70);
			else if(n_A_BaseLV <=89)
				n_A_MaxHP = 3000 + 20 * (n_A_BaseLV-80);
			else if(n_A_BaseLV <=99)
				n_A_MaxHP = wKenseiHP[n_A_BaseLV-90];
		}

		wHPSL = 0;
		if(n_A_JOB == cls_SL)
		{
			if(n_A_BaseLV >= 70){
				if(n_A_BaseLV <= 79)
					wHPSL = (n_A_BaseLV - 70) *40;
				else if(n_A_BaseLV <= 84)
					wHPSL = (n_A_BaseLV - 80) *50;
				else if(n_A_BaseLV <= 89)
					wHPSL = (n_A_BaseLV - 80) *50 -10;
				else if(n_A_BaseLV <= 92)
					wHPSL = (n_A_BaseLV - 90) *50;
				else if(n_A_BaseLV <= 97)
					wHPSL = (n_A_BaseLV - 90) *50 -10;
				else if(n_A_BaseLV == 98) wHPSL = 375;
				else wHPSL = 4;
			}
		}

		if ( n_A_JOB == cls_NIN )
		{
			NinHP = new Array(      131, 137, 144, 151, 159, 167, 175, 184, 193,
							   202, 212, 222, 232, 243, 254, 265, 277, 289, 301,
							   316, 331, 346, 364, 382, 400, 420, 440, 460, 482,
							   504, 526, 548, 572, 596, 620, 646, 672, 698, 726,
							   754, 784, 814, 844, 876, 908, 940, 975,1010,1100,
							  1247,1180,1220,1260,1300,1340,1385,1430,1475,1520, // 50 is correct
							  1565,1615,1665,1715,1765,1815,1880,1935,1990,2045,
							  2100,2160,2200,2280,2340,2400,2460,2520,2580,2640,
							  2705,2770,2835,2900,2965,3030,3100,3170,3240,3310,
							  3380,3455,3530,3605,3680,3760,3840,3920,4000,4250); // 99 is correct
			n_A_MaxHP = NinHP[n_A_BaseLV-1];
		}

		if(n_A_JOB == cls_GUN)
		{
			GunHP = new Array(       38,  44,  50,  57,  64,  73,  82,  93, 104,
							   202, 212, 222, 232, 243, 254, 265, 277, 289, 301,
							   316, 331, 346, 364, 382, 400, 420, 440, 460, 490,
							   520, 550, 580, 610, 650, 680, 710, 740, 770, 800,
							   830, 860, 890, 920, 950, 990,1020,1050,1080,1509,
							  1140,1180,1230,1280,1330,1395,1455,1515,1575,1635, // 50 is correct
							  1695,1760,1820,1885,1950,2015,2080,2145,2210,2275,
							  2340,2410,2480,2550,2620,2690,2760,2830,2900,2970,
							  3040,3115,3190,3265,3340,3415,3490,3565,3640,3715,
							  3790,3870,3950,4030,4110,4190,4270,4350,4330,4510); // 99 is correct
			n_A_MaxHP = GunHP[n_A_BaseLV-1];
		}

                if (n_A_JOB === cls_ENOVI && n_A_BaseLV >= 150) {
                    n_A_MaxHP += 2000;
                }

                if (n_A_JOB === cls_KAGOB) {
                    n_A_MaxHP = JobHP_Third[13][n_A_BaseLV - 99];
                }
	}
	else
	{
//            if (n_A_JOB === cls_RUN || n_A_JOB === cls_RUNt) {
//                var base99HP = 8100;
//                var added100HP = 33;
//
//
//            }
		var k = 0;
		for (var j = 2; j <= n_A_BaseLV; j++)
			k += (HP_COEFF[Math.floor( n_A_JOB / 2 ) - 23][0]*j + 50)/100.0;

		n_A_MaxHP = JobHP_Third[Math.floor( n_A_JOB / 2 ) - 23][n_A_BaseLV - 99];
	}

	// Rebirth ---
	if ( rebirthClass )
	{
		n_A_MaxHP = Math.floor( n_A_MaxHP * 125 / 100 );
	}

	// Adopted ---
	if ( n_A_Adopted )
	{
		n_A_MaxHP = Math.floor( n_A_MaxHP * 70 / 100 );
	}

	// Vit ---
	n_A_MaxHP = Math.floor((n_A_MaxHP - wHPSL) * (100 + n_A_VIT) / 100);

        if ( ( n_A_JOB === cls_SNOVI || n_A_JOB === cls_ENOVI ) && n_A_BaseLV >= 99 )
        {
                n_A_MaxHP += 2000;
        }

	// Additions ---
	var additiveHP = 0;
	additiveHP += n_tok[bon_HP_ADD];
	additiveHP += StPlusCalc2(bon_VIT);
	additiveHP += StPlusCalc2(bon_ALL_STATS);

	if(CardNumSearch(186)) // Remover
		additiveHP -= 40 * n_A_BODY_DEF_PLUS;
	if(n_A_BODY_DEF_PLUS >= 9 && CardNumSearch(225)) // Apocalypse
		additiveHP += 800;
	if(n_A_JobSearch()==cls_MAG) // MageCls
		additiveHP += CardNumSearch(card_HEAD_BANSHEE) * -100; // Banshee
	if(n_A_JobSearch()==cls_SWO) // SwordsCls
		additiveHP += 500 * CardNumSearch(477); // Echio

		//if(n_A_Equip[8]==536){ // ??
	if ( EquipNumSearch( 536 ) )
	{ // Valkyrian Shoes
		wHPVS = n_A_JobSearch();
		if(wHPVS==cls_ACO || wHPVS==cls_ARC || wHPVS==cls_MAG)
			additiveHP += 5 * n_A_BaseLV;
	}
	if(EquipNumSearch(762)) // SnipingSuit R
		additiveHP += 20 * n_A_BaseLV;
	if(EquipNumSearch(770)) // Quill + Small Book Pen
		additiveHP += 3 * n_A_BaseLV;
	if(EquipNumSearch(836)) // Diabolus Boots
		additiveHP += n_A_BaseLV *10;
	if(EquipNumSearch(859)) // Brynhild
		additiveHP += n_A_BaseLV *20;
	if(EquipNumSearch(883) && n_A_BaseLV <= 79) // Badge Academy
		additiveHP += 400 * EquipNumSearch(883);
	if(EquipNumSearch(986)) // Chameleon Armor
		additiveHP += 7 * n_A_BaseLV;
	if(EquipNumSearch(1116) && n_A_JobSearch()==cls_NOV) // Novice Figurine
		additiveHP += 30;
	if(n_A_Weapon_ATKplus >= 6 && EquipNumSearch(1168)) // Withered Branch Staff
		additiveHP += -200;
	if(EquipNumSearch(1172)) // Chronos
		additiveHP += 50 * Math.floor(n_A_Weapon_ATKplus / 2);
	if ( EquipNumSearch( 1360 ) )
	{ // Mascara Chique de Carnaval (bRO)
		additiveHP += n_A_HEAD_DEF_PLUS * 100;
	}
	if ( EquipNumSearch( 1370 ) )
	{ // Sigrun's Wings
		if ( n_A_JobSearch() == cls_NOV )
		{ // Novices
			additiveHP += 80;
		}
	}
	if ( EquipNumSearch( 1475 ) )
	{ // WoE Robe
		if (n_A_BODY_DEF_PLUS >= 9) { additiveHP += 1000; }
	}

	// Items
	if ( usableItems[ksIncreaseHP] > 0 )
	{
		var modifier = 1500;

		if ( usableItems[ksIncreaseHP] === 1 )
		{
			modifier -= 1000;
		}
		else if ( usableItems[ksIncreaseHP] === 3 )
		{
			modifier += 1000;
		}
		additiveHP += Math.floor( 10 / 3 * n_A_BaseLV ) + modifier;
	}

	// Skills
	if ( SkillSearch( skill_CR_FAITH ) )
	{ // Faith
		n_A_MaxHP += SkillSearch(skill_CR_FAITH) * 200;
	}
	if ( performerBuffs[ksChorus] === ksLeradsDew &&
		 performerBuffs[ksChorusLevel] > 0 &&
		 performerBuffs[ksNumPerformers] >= 2 )
	{ // Lerad's Dew
		var skillBonus = 200 * performerBuffs[ksChorusLevel];
		var performerBonus = 300 * performerBuffs[ksNumPerformers];
		if ( performerBonus > 1500 )
		{
			performerBonus = 1500;
		}
		additiveHP += skillBonus + performerBonus;
	}
	if ( SkillSearch( skill_ROY_INSPIRATION ) )
	{ // Inspiration (Skill Level x 600 )
		additiveHP += SkillSearch( skill_ROY_INSPIRATION ) * 600;
	}

	n_A_MaxHP += additiveHP;

	if(n_A_MaxHP < 1)
		n_A_MaxHP = 1;

	// Multipliers ---
	var hpMultiplier = 100;

	hpMultiplier += n_tok[bon_HP_MUL];

	// Cards
	if(SU_VIT >= 80 && CardNumSearch(267))
	{ // Giant Whisper
		hpMultiplier += 3;
	}
	if(n_A_BODY_DEF_PLUS >= 12 && CardNumSearch(519)) // Hardrock Mammoth
		hpMultiplier += 10;
	if(n_A_BODY_DEF_PLUS >= 14 && CardNumSearch(519)) // Hardrock Mammoth
		hpMultiplier += 3;
	if(n_A_SHOES_DEF_PLUS >= 9 && CardNumSearch(304))
	{ // FireLockSoldier
		hpMultiplier += 10;
	}
	if(CardNumSearch(card_GRMT_ALIOT))
	{ // Aliot
		if ( n_A_JobSearch() == cls_SWO ||
			 n_A_JobSearch() == cls_THI ||
			 n_A_JobSearch() == cls_MER )
		{ // SwordCls, ThiefCls, MerchCls
			hpMultiplier += 5;
		}
	}
	if(n_A_SHOES_DEF_PLUS <= 4 && CardNumSearch(407))
	{ // GoldAcidus
		hpMultiplier += 4;
	}

	// Equipment
	if(EquipNumSearch(715))
	{ // Variant Shoes
		hpMultiplier -= n_A_SHOES_DEF_PLUS;
	}
	if(EquipNumSearch(1440))
	{ // Ur's Plate
		hpMultiplier += n_A_BODY_DEF_PLUS;
	}
	if(EquipNumSearch(1442) && n_A_SHOES_DEF_PLUS > 7)
	{ // Ur's Greaves
		hpMultiplier += n_A_SHOES_DEF_PLUS - 7;
	}
	if ( EquipNumSearch( 1292 ) )
	{ // Mental Stick
		if (n_A_Weapon_ATKplus > 5) hpMultiplier -= (n_A_Weapon_ATKplus-5)*2;
	}
	if ( EquipNumSearch( 1477 ) )
	{ // WoE Plate
		if (n_A_BODY_DEF_PLUS >= 9) { hpMultiplier += 25; }
	}
	if ( EquipNumSearch( 1476 ) )
	{ // WoE Suit
		if (n_A_BODY_DEF_PLUS >= 9) { hpMultiplier += 15; }
	}
	if ( EquipNumSearch( 1524 ) && n_A_HEAD_DEF_PLUS >= 1)
	{ // Turkey On Your Head
		hpMultiplier += n_A_HEAD_DEF_PLUS;
	}
	if ( EquipNumSearch( 1525 ) && n_A_HEAD_DEF_PLUS >= 7)
	{ // Sweet Valentine
		hpMultiplier += 4;
		if (n_A_HEAD_DEF_PLUS == 8) { hpMultiplier += 1; }
		else if (n_A_HEAD_DEF_PLUS == 9) { hpMultiplier += 2; }
		else if (n_A_HEAD_DEF_PLUS >= 10) { hpMultiplier += 3; }
	}

	// Items

	// Skills
	if ( performerBuffs[ksBardSolo] === ksSongOfLutie && performerBuffs[ksBardSoloLevel] > 0 )
	{ // Song of Lutie
		var skillBonus = 5 + ( performerBuffs[ksBardSoloLevel] * 2 );
		var musicLessonsBonus = performerBuffs[ksMusicLessons];
		var vitBonus = Math.floor( performerBuffs[ksBardVit] / 10 );
		hpMultiplier += skillBonus + musicLessonsBonus + vitBonus;
	}
	if ( SkillSearch( skill_SUR_GENTLE_TOUCH_CHANGE ) || acolyteBuffs[ksPPChange] > 0 )
	{ // Gentle Touch Convert
		if ( SkillSearch( skill_SUR_GENTLE_TOUCH_CHANGE ) )
		{
			hpMultiplier -= SkillSearch( skill_SUR_GENTLE_TOUCH_CHANGE ) * 4;
		}
		else
		{
			hpMultiplier -= acolyteBuffs[ksPPChange] * 4;
		}
	}
	else if ( SkillSearch( skill_SUR_GENTLE_TOUCH_REVITALIZE ) || acolyteBuffs[ksPPRevitalize] > 0 )
	{ // Gentle Touch Revitalize Max HP increase: [Skill Level x 2] %
		if ( SkillSearch( skill_SUR_GENTLE_TOUCH_REVITALIZE ) )
		{
			hpMultiplier += SkillSearch( skill_SUR_GENTLE_TOUCH_REVITALIZE ) * 2;
		}
		else
		{
			hpMultiplier += acolyteBuffs[ksPPRevitalize] * 2;
		}
	}
	if ( SkillSearch(skill_SOR_SUMMON_TYPE) == 3 && SkillSearch(skill_SOR_SUMMON_LEVEL) > 0 && SkillSearch(skill_SOR_SPIRIT_CONTROL) == 1 ) {
		//Tera
		hpMultiplier += SkillSearch(skill_SOR_SUMMON_LEVEL)*5;
	}
	if ( battleChantBuffs[pass_V_HP] )
	{ // BC +100% HP
		hpMultiplier += 100;
	}
	if ( SkillSearch( skill_SUR_RISING_DRAGON ) )
	{ // Rising Dragon
		hpMultiplier += 2 + SkillSearch( skill_SUR_RISING_DRAGON );
	}
	if ( SkillSearch( skill_ROY_FORCE_OF_VANGUARD ) )
	{ // Force of Vanguard
		hpMultiplier += 3 * SkillSearch( skill_ROY_FORCE_OF_VANGUARD );
	}
	if ( SkillSearch( skill_RUN_STONEHARD_SKIN ) )
	{ // Hagalaz Rune
		hpMultiplier -= 20;
	}
	if ( performerBuffs[ksChorus] === ksWarcryFromBeyond &&
		 performerBuffs[ksChorusLevel] > 0 &&
		 performerBuffs[ksNumPerformers] >= 2 )
	{ // Warcry from Beyond
		var skillReduction = performerBuffs[ksChorusLevel] * 4;
		var performerBonus = performerBuffs[ksNumPerformers] * 4;

		if ( performerBonus > 20 )
		{
			performerBonus = 20;
		}

		hpMultiplier -= skillReduction + performerBonus;
	}
	if ( SkillSearch( skill_ROY_INSPIRATION ) )
	{ // Inspiration (Skill Level x 5 )%
		additiveHP += SkillSearch( skill_ROY_INSPIRATION ) * 5;
	}

	// Apply Multiplier
	n_A_MaxHP = ( n_A_MaxHP * hpMultiplier ) / 100;

	if ( SkillSearch( skill_LK_FRENZY ) ) // Berserk
		n_A_MaxHP *= 3;

	if ( otherBuffs[ksElementField] == ksDeluge && otherBuffs[ksElementFieldLvl] >= 1 )
	{
		var dHP = [5,9,12,14,15];
		n_A_MaxHP = n_A_MaxHP * (100 + dHP[otherBuffs[ksElementFieldLvl]-1]) /100;
	}

	if(n_A_MaxHP < 1) // not negative
		n_A_MaxHP = 1;

	n_A_MaxHP = Math.floor(n_A_MaxHP);

	if (performerBuffs[ksMaestroSolo] === ksFriggsSongM || performerBuffs[ksWandererSolo] === ksFriggsSongW) {
	    var buffHPFriggsSong;

	    if (performerBuffs[ksMaestroSolo] && performerBuffs[ksWandererSolo]) {
		if (performerBuffs[ksMaestroSoloLevel] >= performerBuffs[ksWandererSoloLevel]) {
		    buffHPFriggsSong = performerBuffs[ksMaestroSoloLevel];
		} else {
		    buffHPFriggsSong = performerBuffs[ksWandererSoloLevel];
		}
	    } else {
		if (performerBuffs[ksMaestroSoloLevel]) {
		    buffHPFriggsSong = performerBuffs[ksMaestroSoloLevel];
		} else {
		    buffHPFriggsSong = performerBuffs[ksWandererSoloLevel];
		}
	    }

	    n_A_MaxHP = Math.floor(n_A_MaxHP * (1 + (0.05 * buffHPFriggsSong)));
	}

	return n_A_MaxHP;
}

{JobSP_A = new Array(1, 2, 2, 5, 2, 6, 3,  3,  4, 8, 4, 9, 4,4.7, 5,4.7, 6, 6, 7, 4,1,  3,  4, 8, 4, 9, 4,4.7, 5,4.7, 6, 6, 7, 4,1, 2, 2, 5, 2, 6, 3, 2,4.7, 9,3.75,3.75,  3,  3,  4,  4, 8, 8, 4, 4, 9, 9, 4, 4,4.7,4.7, 5, 5,4.7,4.7, 6, 6, 6, 6, 7, 7, 4, 4, 1, 1);
JobSP_Third = [
/* RK */[300,310,313,316,319,322,325,328,331,334,337,340,343,346,349,352,355,358,361,364,367,370,373,376,379,382,385,388,391,394,397,400,403,406,409,412,415,418,421,424,427,430,433,436,439,442,445,448,451,454,457,460,500,566,629,672,710,748,781,824,847,890,894,898,902,906,910,915,920,925,930,935,941,947,953,959,965,971,977,983,989,995,1001,1007,1013,1019,1025,1031,1037,1043,1049,1055,1061,1067,1073,1079,1085,1091,1097,1103,1109,1115,1121,1127,1133,1139,1145,1151,1157,1163,1169,1175,1181,1187,1193,1199,1205,1211,1217,1223,1229,1235,1241,1247,1253,1259,1265,1271,1277,1283,1289,1295,1301,1307,1313,1319,1325,1331,1337,1343,1349,1355,1361,1367,1373,1379,1385,1391,1397,1403,1409,1415,1421,1427,1433,1439,1445,1451,1457,1463,1469,1475,1481,1487,1493,1499,1505,1511,1517,1523,1529,1535,1541,1547,1553,1559,1565,1571,1577,1583,1589,1595,1601,1607,1613,1619,1625,1631,1637,1643,1649,1655,1661,1667,1673,1679,1685,1691,1697,1703,1709,1715,1721,1727,1733,1739,1745,1751,1757,1763,1769,1775,1781,1787,1793,1799,1805,1811,1817,1823,1829,1835,1841,1847,1853,1859,1865,1871,1877,1883,1889,1895,1901,1907,1913,1919,1925,1931,1937,1943,1949,1955,1961,1967,1973,1979,1985,1991,1997,2003,2009,2015,2021,2027,2033,2039,2045,2051,2057,2063,2069,2075,2081,2087,2093,2099,2105,2111,2117,2123,2129,2135,2141,2147,2153,2159,2165,2171,2177,2183,2189,2195,2201,2207,2213,2219,2225,2231,2237,2243,2249,2255,2261,2267,2273,2279,2285,2291,2297,2303,2309,2315,2321,2327,2333,2339,2345,2351,2357,2363,2369,2375,2381,2387,2393,2399,2405,2411,2417,2423,2429,2435,2441,2447,2453,2459,2465,2471,2477,2483,2489,2495,2501,2507,2513,2519,2525,2531,2537,2543,2549,2555,2561,2567,2573,2579,2585,2591,2597,2603,2609,2615,2621,2627,2633,2639,2645,2651,2657,2663,2669,2675,2681,2687,2693,2699,2705,2711,2717,2723,2729,2735,2741,2747,2753,2759,2765,2771,2777,2783,2789,2795,2801,2807,2813,2819,2825,2831,2837,2843,2849,2855,2861,2867,2873,2879,2885,2891,2897,2903,2909,2915],
/* GX */[400,410,414,418,422,426,430,434,438,442,446,450,454,458,462,466,470,474,478,482,486,490,494,498,502,506,510,514,518,522,526,530,534,538,542,546,550,554,558,562,566,570,574,578,582,586,590,594,598,602,606,610,670,695,700,715,730,745,760,785,790,805,810,815,820,825,830,836,842,848,854,860,867,874,881,888,895,902,909,916,923,930,937,944,951,958,965,972,979,986,993,1000,1007,1014,1021,1028,1035,1042,1049,1056,1063,1070,1077,1084,1091,1098,1105,1112,1119,1126,1133,1140,1147,1154,1161,1168,1175,1182,1189,1196,1203,1210,1217,1224,1231,1238,1245,1252,1259,1266,1273,1280,1287,1294,1301,1308,1315,1322,1329,1336,1343,1350,1357,1364,1371,1378,1385,1392,1399,1406,1413,1420,1427,1434,1441,1448,1455,1462,1469,1476,1483,1490,1497,1504,1511,1518,1525,1532,1539,1546,1553,1560,1567,1574,1581,1588,1595,1602,1609,1616,1623,1630,1637,1644,1651,1658,1665,1672,1679,1686,1693,1700,1707,1714,1721,1728,1735,1742,1749,1756,1763,1770,1777,1784,1791,1798,1805,1812,1819,1826,1833,1840,1847,1854,1861,1868,1875,1882,1889,1896,1903,1910,1917,1924,1931,1938,1945,1952,1959,1966,1973,1980,1987,1994,2001,2008,2015,2022,2029,2036,2043,2050,2057,2064,2071,2078,2085,2092,2099,2106,2113,2120,2127,2134,2141,2148,2155,2162,2169,2176,2183,2190,2197,2204,2211,2218,2225,2232,2239,2246,2253,2260,2267,2274,2281,2288,2295,2302,2309,2316,2323,2330,2337,2344,2351,2358,2365,2372,2379,2386,2393,2400,2407,2414,2421,2428,2435,2442,2449,2456,2463,2470,2477,2484,2491,2498,2505,2512,2519,2526,2533,2540,2547,2554,2561,2568,2575,2582,2589,2596,2603,2610,2617,2624,2631,2638,2645,2652,2659,2666,2673,2680,2687,2694,2701,2708,2715,2722,2729,2736,2743,2750,2757,2764,2771,2778,2785,2792,2799,2806,2813,2820,2827,2834,2841,2848,2855,2862,2869,2876,2883,2890,2897,2904,2911,2918,2925,2932,2939,2946,2953,2960,2967,2974,2981,2988,2995,3002,3009,3016,3023,3030,3037,3044,3051,3058,3065,3072,3079,3086,3093,3100,3107,3114,3121,3128,3135,3142,3149,3156,3163,3170],

/* AB */[800,810,818,826,834,842,850,858,866,874,882,890,898,906,914,922,930,938,946,954,962,970,978,986,994,1002,1010,1018,1026,1034,1042,1050,1058,1066,1074,1082,1090,1098,1106,1114,1122,1130,1138,1146,1154,1162,1170,1178,1186,1194,1202,1210,1258,1286,1334,1372,1410,1458,1466,1474,1482,1490,1499,1508,1517,1526,1535,1545,1555,1565,1575,1585,1596,1607,1618,1629,1640,1651,1662,1673,1684,1695,1706,1717,1728,1739,1750,1761,1772,1783,1794,1805,1816,1827,1838,1849,1860,1871,1882,1893,1904,1915,1926,1937,1948,1959,1970,1981,1992,2003,2014,2025,2036,2047,2058,2069,2080,2091,2102,2113,2124,2135,2146,2157,2168,2179,2190,2201,2212,2223,2234,2245,2256,2267,2278,2289,2300,2311,2322,2333,2344,2355,2366,2377,2388,2399,2410,2421,2432,2443,2454,2465,2476,2487,2498,2509,2520,2531,2542,2553,2564,2575,2586,2597,2608,2619,2630,2641,2652,2663,2674,2685,2696,2707,2718,2729,2740,2751,2762,2773,2784,2795,2806,2817,2828,2839,2850,2861,2872,2883,2894,2905,2916,2927,2938,2949,2960,2971,2982,2993,3004,3015,3026,3037,3048,3059,3070,3081,3092,3103,3114,3125,3136,3147,3158,3169,3180,3191,3202,3213,3224,3235,3246,3257,3268,3279,3290,3301,3312,3323,3334,3345,3356,3367,3378,3389,3400,3411,3422,3433,3444,3455,3466,3477,3488,3499,3510,3521,3532,3543,3554,3565,3576,3587,3598,3609,3620,3631,3642,3653,3664,3675,3686,3697,3708,3719,3730,3741,3752,3763,3774,3785,3796,3807,3818,3829,3840,3851,3862,3873,3884,3895,3906,3917,3928,3939,3950,3961,3972,3983,3994,4005,4016,4027,4038,4049,4060,4071,4082,4093,4104,4115,4126,4137,4148,4159,4170,4181,4192,4203,4214,4225,4236,4247,4258,4269,4280,4291,4302,4313,4324,4335,4346,4357,4368,4379,4390,4401,4412,4423,4434,4445,4456,4467,4478,4489,4500,4511,4522,4533,4544,4555,4566,4577,4588,4599,4610,4621,4632,4643,4654,4665,4676,4687,4698,4709,4720,4731,4742,4753,4764,4775,4786,4797,4808,4819,4830,4841,4852,4863,4874,4885,4896,4907,4918,4929,4940,4951,4962,4973,4984,4995,5006,5017,5028,5039,5050,5061,5072,5083,5094,5105,5116,5127,5138,5149,5160,5171,5182,5193,5204,5215],
/* RA */[400,410,414,418,422,426,430,434,438,442,446,450,454,458,462,466,470,474,478,482,486,490,494,498,502,506,510,514,518,522,526,530,534,538,542,546,550,554,558,562,566,570,574,578,582,586,590,594,598,602,606,610,650,675,680,695,710,725,740,765,770,785,790,795,800,805,810,816,822,828,834,840,847,854,861,868,875,882,889,896,903,910,917,924,931,938,945,952,959,966,973,980,987,994,1001,1008,1015,1022,1029,1036,1043,1050,1057,1064,1071,1078,1085,1092,1099,1106,1113,1120,1127,1134,1141,1148,1155,1162,1169,1176,1183,1190,1197,1204,1211,1218,1225,1232,1239,1246,1253,1260,1267,1274,1281,1288,1295,1302,1309,1316,1323,1330,1337,1344,1351,1358,1365,1372,1379,1386,1393,1400,1407,1414,1421,1428,1435,1442,1449,1456,1463,1470,1477,1484,1491,1498,1505,1512,1519,1526,1533,1540,1547,1554,1561,1568,1575,1582,1589,1596,1603,1610,1617,1624,1631,1638,1645,1652,1659,1666,1673,1680,1687,1694,1701,1708,1715,1722,1729,1736,1743,1750,1757,1764,1771,1778,1785,1792,1799,1806,1813,1820,1827,1834,1841,1848,1855,1862,1869,1876,1883,1890,1897,1904,1911,1918,1925,1932,1939,1946,1953,1960,1967,1974,1981,1988,1995,2002,2009,2016,2023,2030,2037,2044,2051,2058,2065,2072,2079,2086,2093,2100,2107,2114,2121,2128,2135,2142,2149,2156,2163,2170,2177,2184,2191,2198,2205,2212,2219,2226,2233,2240,2247,2254,2261,2268,2275,2282,2289,2296,2303,2310,2317,2324,2331,2338,2345,2352,2359,2366,2373,2380,2387,2394,2401,2408,2415,2422,2429,2436,2443,2450,2457,2464,2471,2478,2485,2492,2499,2506,2513,2520,2527,2534,2541,2548,2555,2562,2569,2576,2583,2590,2597,2604,2611,2618,2625,2632,2639,2646,2653,2660,2667,2674,2681,2688,2695,2702,2709,2716,2723,2730,2737,2744,2751,2758,2765,2772,2779,2786,2793,2800,2807,2814,2821,2828,2835,2842,2849,2856,2863,2870,2877,2884,2891,2898,2905,2912,2919,2926,2933,2940,2947,2954,2961,2968,2975,2982,2989,2996,3003,3010,3017,3024,3031,3038,3045,3052,3059,3066,3073,3080,3087,3094,3101,3108,3115,3122,3129,3136,3143,3150],
/* WL */[900,910,919,928,937,946,955,964,973,982,991,1000,1009,1018,1027,1036,1045,1054,1063,1072,1081,1090,1099,1108,1117,1126,1135,1144,1153,1162,1171,1180,1189,1198,1207,1216,1225,1234,1243,1252,1261,1270,1279,1288,1297,1306,1315,1324,1333,1342,1351,1360,1369,1378,1387,1396,1405,1414,1423,1432,1441,1450,1460,1470,1480,1490,1500,1511,1522,1533,1544,1555,1567,1579,1591,1603,1615,1627,1639,1651,1663,1675,1687,1699,1711,1723,1735,1747,1759,1771,1783,1795,1807,1819,1831,1843,1855,1867,1879,1891,1903,1915,1927,1939,1951,1963,1975,1987,1999,2011,2023,2035,2047,2059,2071,2083,2095,2107,2119,2131,2143,2155,2167,2179,2191,2203,2215,2227,2239,2251,2263,2275,2287,2299,2311,2323,2335,2347,2359,2371,2383,2395,2407,2419,2431,2443,2455,2467,2479,2491,2503,2515,2527,2539,2551,2563,2575,2587,2599,2611,2623,2635,2647,2659,2671,2683,2695,2707,2719,2731,2743,2755,2767,2779,2791,2803,2815,2827,2839,2851,2863,2875,2887,2899,2911,2923,2935,2947,2959,2971,2983,2995,3007,3019,3031,3043,3055,3067,3079,3091,3103,3115,3127,3139,3151,3163,3175,3187,3199,3211,3223,3235,3247,3259,3271,3283,3295,3307,3319,3331,3343,3355,3367,3379,3391,3403,3415,3427,3439,3451,3463,3475,3487,3499,3511,3523,3535,3547,3559,3571,3583,3595,3607,3619,3631,3643,3655,3667,3679,3691,3703,3715,3727,3739,3751,3763,3775,3787,3799,3811,3823,3835,3847,3859,3871,3883,3895,3907,3919,3931,3943,3955,3967,3979,3991,4003,4015,4027,4039,4051,4063,4075,4087,4099,4111,4123,4135,4147,4159,4171,4183,4195,4207,4219,4231,4243,4255,4267,4279,4291,4303,4315,4327,4339,4351,4363,4375,4387,4399,4411,4423,4435,4447,4459,4471,4483,4495,4507,4519,4531,4543,4555,4567,4579,4591,4603,4615,4627,4639,4651,4663,4675,4687,4699,4711,4723,4735,4747,4759,4771,4783,4795,4807,4819,4831,4843,4855,4867,4879,4891,4903,4915,4927,4939,4951,4963,4975,4987,4999,5011,5023,5035,5047,5059,5071,5083,5095,5107,5119,5131,5143,5155,5167,5179,5191,5203,5215,5227,5239,5251,5263,5275,5287,5299,5311,5323,5335,5347,5359,5371,5383,5395,5407,5419,5431,5443,5455,5467,5479,5491,5503,5515],
/* ME */[400,410,414,418,422,426,430,434,438,442,446,450,454,458,462,466,470,474,478,482,486,490,494,498,502,506,510,514,518,522,526,530,534,538,542,546,550,554,558,562,566,570,574,578,582,586,590,594,598,602,606,610,700,760,820,880,930,965,1020,1132,1160,1230,1235,1240,1245,1250,1255,1261,1267,1273,1279,1285,1292,1299,1306,1313,1320,1327,1334,1341,1348,1355,1362,1369,1376,1383,1390,1397,1404,1411,1418,1425,1432,1439,1446,1453,1460,1467,1474,1481,1488,1495,1502,1509,1516,1523,1530,1537,1544,1551,1558,1565,1572,1579,1586,1593,1600,1607,1614,1621,1628,1635,1642,1649,1656,1663,1670,1677,1684,1691,1698,1705,1712,1719,1726,1733,1740,1747,1754,1761,1768,1775,1782,1789,1796,1803,1810,1817,1824,1831,1838,1845,1852,1859,1866,1873,1880,1887,1894,1901,1908,1915,1922,1929,1936,1943,1950,1957,1964,1971,1978,1985,1992,1999,2006,2013,2020,2027,2034,2041,2048,2055,2062,2069,2076,2083,2090,2097,2104,2111,2118,2125,2132,2139,2146,2153,2160,2167,2174,2181,2188,2195,2202,2209,2216,2223,2230,2237,2244,2251,2258,2265,2272,2279,2286,2293,2300,2307,2314,2321,2328,2335,2342,2349,2356,2363,2370,2377,2384,2391,2398,2405,2412,2419,2426,2433,2440,2447,2454,2461,2468,2475,2482,2489,2496,2503,2510,2517,2524,2531,2538,2545,2552,2559,2566,2573,2580,2587,2594,2601,2608,2615,2622,2629,2636,2643,2650,2657,2664,2671,2678,2685,2692,2699,2706,2713,2720,2727,2734,2741,2748,2755,2762,2769,2776,2783,2790,2797,2804,2811,2818,2825,2832,2839,2846,2853,2860,2867,2874,2881,2888,2895,2902,2909,2916,2923,2930,2937,2944,2951,2958,2965,2972,2979,2986,2993,3000,3007,3014,3021,3028,3035,3042,3049,3056,3063,3070,3077,3084,3091,3098,3105,3112,3119,3126,3133,3140,3147,3154,3161,3168,3175,3182,3189,3196,3203,3210,3217,3224,3231,3238,3245,3252,3259,3266,3273,3280,3287,3294,3301,3308,3315,3322,3329,3336,3343,3350,3357,3364,3371,3378,3385,3392,3399,3406,3413,3420,3427,3434,3441,3448,3455,3462,3469,3476,3483,3490,3497,3504,3511,3518,3525,3532,3539,3546,3553,3560,3567,3574,3581,3588,3595],
/* RG */[400,410,414,418,422,426,430,434,438,442,446,450,454,458,462,466,470,474,478,482,486,490,494,498,502,506,510,514,518,522,526,530,534,538,542,546,550,554,558,562,566,570,574,578,582,586,590,594,598,602,606,610,700,760,820,880,930,965,1020,1132,1160,1230,1235,1240,1245,1250,1255,1261,1267,1273,1279,1285,1292,1299,1306,1313,1320,1327,1334,1341,1348,1355,1362,1369,1376,1383,1390,1397,1404,1411,1418,1425,1432,1439,1446,1453,1460,1467,1474,1481,1488,1495,1502,1509,1516,1523,1530,1537,1544,1551,1558,1565,1572,1579,1586,1593,1600,1607,1614,1621,1628,1635,1642,1649,1656,1663,1670,1677,1684,1691,1698,1705,1712,1719,1726,1733,1740,1747,1754,1761,1768,1775,1782,1789,1796,1803,1810,1817,1824,1831,1838,1845,1852,1859,1866,1873,1880,1887,1894,1901,1908,1915,1922,1929,1936,1943,1950,1957,1964,1971,1978,1985,1992,1999,2006,2013,2020,2027,2034,2041,2048,2055,2062,2069,2076,2083,2090,2097,2104,2111,2118,2125,2132,2139,2146,2153,2160,2167,2174,2181,2188,2195,2202,2209,2216,2223,2230,2237,2244,2251,2258,2265,2272,2279,2286,2293,2300,2307,2314,2321,2328,2335,2342,2349,2356,2363,2370,2377,2384,2391,2398,2405,2412,2419,2426,2433,2440,2447,2454,2461,2468,2475,2482,2489,2496,2503,2510,2517,2524,2531,2538,2545,2552,2559,2566,2573,2580,2587,2594,2601,2608,2615,2622,2629,2636,2643,2650,2657,2664,2671,2678,2685,2692,2699,2706,2713,2720,2727,2734,2741,2748,2755,2762,2769,2776,2783,2790,2797,2804,2811,2818,2825,2832,2839,2846,2853,2860,2867,2874,2881,2888,2895,2902,2909,2916,2923,2930,2937,2944,2951,2958,2965,2972,2979,2986,2993,3000,3007,3014,3021,3028,3035,3042,3049,3056,3063,3070,3077,3084,3091,3098,3105,3112,3119,3126,3133,3140,3147,3154,3161,3168,3175,3182,3189,3196,3203,3210,3217,3224,3231,3238,3245,3252,3259,3266,3273,3280,3287,3294,3301,3308,3315,3322,3329,3336,3343,3350,3357,3364,3371,3378,3385,3392,3399,3406,3413,3420,3427,3434,3441,3448,3455,3462,3469,3476,3483,3490,3497,3504,3511,3518,3525,3532,3539,3546,3553,3560,3567,3574,3581,3588,3595],
/* SC */[400,410,414,418,422,426,430,434,438,442,446,450,454,458,462,466,470,474,478,482,486,490,494,498,502,506,510,514,518,522,526,530,534,538,542,546,550,554,558,562,566,570,574,578,582,586,590,594,598,602,606,610,614,618,622,626,630,634,638,642,646,650,655,660,665,670,675,681,687,693,699,705,712,719,726,733,740,747,754,761,768,775,782,789,796,803,810,817,824,831,838,845,852,859,866,873,880,887,894,901,908,915,922,929,936,943,950,957,964,971,978,985,992,999,1006,1013,1020,1027,1034,1041,1048,1055,1062,1069,1076,1083,1090,1097,1104,1111,1118,1125,1132,1139,1146,1153,1160,1167,1174,1181,1188,1195,1202,1209,1216,1223,1230,1237,1244,1251,1258,1265,1272,1279,1286,1293,1300,1307,1314,1321,1328,1335,1342,1349,1356,1363,1370,1377,1384,1391,1398,1405,1412,1419,1426,1433,1440,1447,1454,1461,1468,1475,1482,1489,1496,1503,1510,1517,1524,1531,1538,1545,1552,1559,1566,1573,1580,1587,1594,1601,1608,1615,1622,1629,1636,1643,1650,1657,1664,1671,1678,1685,1692,1699,1706,1713,1720,1727,1734,1741,1748,1755,1762,1769,1776,1783,1790,1797,1804,1811,1818,1825,1832,1839,1846,1853,1860,1867,1874,1881,1888,1895,1902,1909,1916,1923,1930,1937,1944,1951,1958,1965,1972,1979,1986,1993,2000,2007,2014,2021,2028,2035,2042,2049,2056,2063,2070,2077,2084,2091,2098,2105,2112,2119,2126,2133,2140,2147,2154,2161,2168,2175,2182,2189,2196,2203,2210,2217,2224,2231,2238,2245,2252,2259,2266,2273,2280,2287,2294,2301,2308,2315,2322,2329,2336,2343,2350,2357,2364,2371,2378,2385,2392,2399,2406,2413,2420,2427,2434,2441,2448,2455,2462,2469,2476,2483,2490,2497,2504,2511,2518,2525,2532,2539,2546,2553,2560,2567,2574,2581,2588,2595,2602,2609,2616,2623,2630,2637,2644,2651,2658,2665,2672,2679,2686,2693,2700,2707,2714,2721,2728,2735,2742,2749,2756,2763,2770,2777,2784,2791,2798,2805,2812,2819,2826,2833,2840,2847,2854,2861,2868,2875,2882,2889,2896,2903,2910,2917,2924,2931,2938,2945,2952,2959,2966,2973,2980,2987,2994,3001,3008,3015],
/* SU */[400,410,414,418,422,426,430,434,438,442,446,450,454,458,462,466,470,474,478,482,486,490,494,498,502,506,510,514,518,522,526,530,534,538,542,546,550,554,558,562,566,570,574,578,582,586,590,594,598,602,606,610,614,618,622,626,630,634,638,642,646,650,655,660,665,670,675,681,687,693,699,705,712,719,726,733,740,747,754,761,768,775,782,789,796,803,810,817,824,831,838,845,852,859,866,873,880,887,894,901,908,915,922,929,936,943,950,957,964,971,978,985,992,999,1006,1013,1020,1027,1034,1041,1048,1055,1062,1069,1076,1083,1090,1097,1104,1111,1118,1125,1132,1139,1146,1153,1160,1167,1174,1181,1188,1195,1202,1209,1216,1223,1230,1237,1244,1251,1258,1265,1272,1279,1286,1293,1300,1307,1314,1321,1328,1335,1342,1349,1356,1363,1370,1377,1384,1391,1398,1405,1412,1419,1426,1433,1440,1447,1454,1461,1468,1475,1482,1489,1496,1503,1510,1517,1524,1531,1538,1545,1552,1559,1566,1573,1580,1587,1594,1601,1608,1615,1622,1629,1636,1643,1650,1657,1664,1671,1678,1685,1692,1699,1706,1713,1720,1727,1734,1741,1748,1755,1762,1769,1776,1783,1790,1797,1804,1811,1818,1825,1832,1839,1846,1853,1860,1867,1874,1881,1888,1895,1902,1909,1916,1923,1930,1937,1944,1951,1958,1965,1972,1979,1986,1993,2000,2007,2014,2021,2028,2035,2042,2049,2056,2063,2070,2077,2084,2091,2098,2105,2112,2119,2126,2133,2140,2147,2154,2161,2168,2175,2182,2189,2196,2203,2210,2217,2224,2231,2238,2245,2252,2259,2266,2273,2280,2287,2294,2301,2308,2315,2322,2329,2336,2343,2350,2357,2364,2371,2378,2385,2392,2399,2406,2413,2420,2427,2434,2441,2448,2455,2462,2469,2476,2483,2490,2497,2504,2511,2518,2525,2532,2539,2546,2553,2560,2567,2574,2581,2588,2595,2602,2609,2616,2623,2630,2637,2644,2651,2658,2665,2672,2679,2686,2693,2700,2707,2714,2721,2728,2735,2742,2749,2756,2763,2770,2777,2784,2791,2798,2805,2812,2819,2826,2833,2840,2847,2854,2861,2868,2875,2882,2889,2896,2903,2910,2917,2924,2931,2938,2945,2952,2959,2966,2973,2980,2987,2994,3001,3008,3015],
/* MI */[400,410,414,418,422,426,430,434,438,442,446,450,454,458,462,466,470,474,478,482,486,490,494,498,502,506,510,514,518,522,526,530,534,538,542,546,550,554,558,562,566,570,574,578,582,586,590,594,598,602,606,610,614,648,702,726,750,774,808,822,846,850,855,860,865,870,875,881,887,893,899,905,912,919,926,933,940,947,954,961,968,975,982,989,996,1003,1010,1017,1024,1031,1038,1045,1052,1059,1066,1073,1080,1087,1094,1101,1108,1115,1122,1129,1136,1143,1150,1157,1164,1171,1178,1185,1192,1199,1206,1213,1220,1227,1234,1241,1248,1255,1262,1269,1276,1283,1290,1297,1304,1311,1318,1325,1332,1339,1346,1353,1360,1367,1374,1381,1388,1395,1402,1409,1416,1423,1430,1437,1444,1451,1458,1465,1472,1479,1486,1493,1500,1507,1514,1521,1528,1535,1542,1549,1556,1563,1570,1577,1584,1591,1598,1605,1612,1619,1626,1633,1640,1647,1654,1661,1668,1675,1682,1689,1696,1703,1710,1717,1724,1731,1738,1745,1752,1759,1766,1773,1780,1787,1794,1801,1808,1815,1822,1829,1836,1843,1850,1857,1864,1871,1878,1885,1892,1899,1906,1913,1920,1927,1934,1941,1948,1955,1962,1969,1976,1983,1990,1997,2004,2011,2018,2025,2032,2039,2046,2053,2060,2067,2074,2081,2088,2095,2102,2109,2116,2123,2130,2137,2144,2151,2158,2165,2172,2179,2186,2193,2200,2207,2214,2221,2228,2235,2242,2249,2256,2263,2270,2277,2284,2291,2298,2305,2312,2319,2326,2333,2340,2347,2354,2361,2368,2375,2382,2389,2396,2403,2410,2417,2424,2431,2438,2445,2452,2459,2466,2473,2480,2487,2494,2501,2508,2515,2522,2529,2536,2543,2550,2557,2564,2571,2578,2585,2592,2599,2606,2613,2620,2627,2634,2641,2648,2655,2662,2669,2676,2683,2690,2697,2704,2711,2718,2725,2732,2739,2746,2753,2760,2767,2774,2781,2788,2795,2802,2809,2816,2823,2830,2837,2844,2851,2858,2865,2872,2879,2886,2893,2900,2907,2914,2921,2928,2935,2942,2949,2956,2963,2970,2977,2984,2991,2998,3005,3012,3019,3026,3033,3040,3047,3054,3061,3068,3075,3082,3089,3096,3103,3110,3117,3124,3131,3138,3145,3152,3159,3166,3173,3180,3187,3194,3201,3208,3215],
/* WA */[400,410,414,418,422,426,430,434,438,442,446,450,454,458,462,466,470,474,478,482,486,490,494,498,502,506,510,514,518,522,526,530,534,538,542,546,550,554,558,562,566,570,574,578,582,586,590,594,598,602,606,610,614,648,702,726,750,774,808,822,846,850,855,860,865,870,875,881,887,893,899,905,912,919,926,933,940,947,954,961,968,975,982,989,996,1003,1010,1017,1024,1031,1038,1045,1052,1059,1066,1073,1080,1087,1094,1101,1108,1115,1122,1129,1136,1143,1150,1157,1164,1171,1178,1185,1192,1199,1206,1213,1220,1227,1234,1241,1248,1255,1262,1269,1276,1283,1290,1297,1304,1311,1318,1325,1332,1339,1346,1353,1360,1367,1374,1381,1388,1395,1402,1409,1416,1423,1430,1437,1444,1451,1458,1465,1472,1479,1486,1493,1500,1507,1514,1521,1528,1535,1542,1549,1556,1563,1570,1577,1584,1591,1598,1605,1612,1619,1626,1633,1640,1647,1654,1661,1668,1675,1682,1689,1696,1703,1710,1717,1724,1731,1738,1745,1752,1759,1766,1773,1780,1787,1794,1801,1808,1815,1822,1829,1836,1843,1850,1857,1864,1871,1878,1885,1892,1899,1906,1913,1920,1927,1934,1941,1948,1955,1962,1969,1976,1983,1990,1997,2004,2011,2018,2025,2032,2039,2046,2053,2060,2067,2074,2081,2088,2095,2102,2109,2116,2123,2130,2137,2144,2151,2158,2165,2172,2179,2186,2193,2200,2207,2214,2221,2228,2235,2242,2249,2256,2263,2270,2277,2284,2291,2298,2305,2312,2319,2326,2333,2340,2347,2354,2361,2368,2375,2382,2389,2396,2403,2410,2417,2424,2431,2438,2445,2452,2459,2466,2473,2480,2487,2494,2501,2508,2515,2522,2529,2536,2543,2550,2557,2564,2571,2578,2585,2592,2599,2606,2613,2620,2627,2634,2641,2648,2655,2662,2669,2676,2683,2690,2697,2704,2711,2718,2725,2732,2739,2746,2753,2760,2767,2774,2781,2788,2795,2802,2809,2816,2823,2830,2837,2844,2851,2858,2865,2872,2879,2886,2893,2900,2907,2914,2921,2928,2935,2942,2949,2956,2963,2970,2977,2984,2991,2998,3005,3012,3019,3026,3033,3040,3047,3054,3061,3068,3075,3082,3089,3096,3103,3110,3117,3124,3131,3138,3145,3152,3159,3166,3173,3180,3187,3194,3201,3208,3215],
/* SO */[900,910,919,928,937,946,955,964,973,982,991,1000,1009,1018,1027,1036,1045,1054,1063,1072,1081,1090,1099,1108,1117,1126,1135,1144,1153,1162,1171,1180,1189,1198,1207,1216,1225,1234,1243,1252,1261,1270,1279,1288,1297,1306,1315,1324,1333,1342,1351,1360,1369,1378,1387,1396,1405,1414,1423,1432,1441,1450,1460,1470,1480,1490,1500,1511,1522,1533,1544,1555,1567,1579,1591,1603,1615,1627,1639,1651,1663,1675,1687,1699,1711,1723,1735,1747,1759,1771,1783,1795,1807,1819,1831,1843,1855,1867,1879,1891,1903,1915,1927,1939,1951,1963,1975,1987,1999,2011,2023,2035,2047,2059,2071,2083,2095,2107,2119,2131,2143,2155,2167,2179,2191,2203,2215,2227,2239,2251,2263,2275,2287,2299,2311,2323,2335,2347,2359,2371,2383,2395,2407,2419,2431,2443,2455,2467,2479,2491,2503,2515,2527,2539,2551,2563,2575,2587,2599,2611,2623,2635,2647,2659,2671,2683,2695,2707,2719,2731,2743,2755,2767,2779,2791,2803,2815,2827,2839,2851,2863,2875,2887,2899,2911,2923,2935,2947,2959,2971,2983,2995,3007,3019,3031,3043,3055,3067,3079,3091,3103,3115,3127,3139,3151,3163,3175,3187,3199,3211,3223,3235,3247,3259,3271,3283,3295,3307,3319,3331,3343,3355,3367,3379,3391,3403,3415,3427,3439,3451,3463,3475,3487,3499,3511,3523,3535,3547,3559,3571,3583,3595,3607,3619,3631,3643,3655,3667,3679,3691,3703,3715,3727,3739,3751,3763,3775,3787,3799,3811,3823,3835,3847,3859,3871,3883,3895,3907,3919,3931,3943,3955,3967,3979,3991,4003,4015,4027,4039,4051,4063,4075,4087,4099,4111,4123,4135,4147,4159,4171,4183,4195,4207,4219,4231,4243,4255,4267,4279,4291,4303,4315,4327,4339,4351,4363,4375,4387,4399,4411,4423,4435,4447,4459,4471,4483,4495,4507,4519,4531,4543,4555,4567,4579,4591,4603,4615,4627,4639,4651,4663,4675,4687,4699,4711,4723,4735,4747,4759,4771,4783,4795,4807,4819,4831,4843,4855,4867,4879,4891,4903,4915,4927,4939,4951,4963,4975,4987,4999,5011,5023,5035,5047,5059,5071,5083,5095,5107,5119,5131,5143,5155,5167,5179,5191,5203,5215,5227,5239,5251,5263,5275,5287,5299,5311,5323,5335,5347,5359,5371,5383,5395,5407,5419,5431,5443,5455,5467,5479,5491,5503,5515],
/* GE */[900,910,919,928,937,946,955,964,973,982,991,1000,1009,1018,1027,1036,1045,1054,1063,1072,1081,1090,1099,1108,1117,1126,1135,1144,1153,1162,1171,1180,1189,1198,1207,1216,1225,1234,1243,1252,1261,1270,1279,1288,1297,1306,1315,1324,1333,1342,1351,1360,1369,1378,1387,1396,1405,1414,1423,1432,1441,1450,1460,1470,1480,1490,1500,1511,1522,1533,1544,1555,1567,1579,1591,1603,1615,1627,1639,1651,1663,1675,1687,1699,1711,1723,1735,1747,1759,1771,1783,1795,1807,1819,1831,1843,1855,1867,1879,1891,1903,1915,1927,1939,1951,1963,1975,1987,1999,2011,2023,2035,2047,2059,2071,2083,2095,2107,2119,2131,2143,2155,2167,2179,2191,2203,2215,2227,2239,2251,2263,2275,2287,2299,2311,2323,2335,2347,2359,2371,2383,2395,2407,2419,2431,2443,2455,2467,2479,2491,2503,2515,2527,2539,2551,2563,2575,2587,2599,2611,2623,2635,2647,2659,2671,2683,2695,2707,2719,2731,2743,2755,2767,2779,2791,2803,2815,2827,2839,2851,2863,2875,2887,2899,2911,2923,2935,2947,2959,2971,2983,2995,3007,3019,3031,3043,3055,3067,3079,3091,3103,3115,3127,3139,3151,3163,3175,3187,3199,3211,3223,3235,3247,3259,3271,3283,3295,3307,3319,3331,3343,3355,3367,3379,3391,3403,3415,3427,3439,3451,3463,3475,3487,3499,3511,3523,3535,3547,3559,3571,3583,3595,3607,3619,3631,3643,3655,3667,3679,3691,3703,3715,3727,3739,3751,3763,3775,3787,3799,3811,3823,3835,3847,3859,3871,3883,3895,3907,3919,3931,3943,3955,3967,3979,3991,4003,4015,4027,4039,4051,4063,4075,4087,4099,4111,4123,4135,4147,4159,4171,4183,4195,4207,4219,4231,4243,4255,4267,4279,4291,4303,4315,4327,4339,4351,4363,4375,4387,4399,4411,4423,4435,4447,4459,4471,4483,4495,4507,4519,4531,4543,4555,4567,4579,4591,4603,4615,4627,4639,4651,4663,4675,4687,4699,4711,4723,4735,4747,4759,4771,4783,4795,4807,4819,4831,4843,4855,4867,4879,4891,4903,4915,4927,4939,4951,4963,4975,4987,4999,5011,5023,5035,5047,5059,5071,5083,5095,5107,5119,5131,5143,5155,5167,5179,5191,5203,5215,5227,5239,5251,5263,5275,5287,5299,5311,5323,5335,5347,5359,5371,5383,5395,5407,5419,5431,5443,5455,5467,5479,5491,5503,5515],
/* KO */[522,530,538,546,554,562,570,578,586,594,602,610,618,626,634,642,650,658,666,674,682,690,698,706,714,722,730,738,746,754,762,770,778,786,794,802,810,818,826,834,842,850,858,866,874,882,890,898,906,914,922,930,938,946,954,962,970,978,986,994,1002,1010,1018,1026,1034,1042,1050,1058,1066,1074,1082,1090,1098,1106,1114,1122,1130,1138,1146,1154,1162,1170,1178,1186,1194,1202,1210,1218,1226,1234,1242,1250,1258,1266,1274,1282,1290,1298,1306,1314,1322,1330,1338,1346,1354,1362,1370,1378,1386,1394,1402,1410,1418,1426,1434,1442,1450,1458,1466,1474,1482,1490,1498,1506,1514,1522,1530,1538,1546,1554,1562,1570,1578,1586,1594,1602,1610,1618,1626,1634,1642,1650,1658,1666,1674,1682,1690,1698,1706,1714,1722,1730,1738,1746,1754,1762,1770,1778,1786,1794,1802,1810,1818,1826,1834,1842,1850,1858,1866,1874,1882,1890,1898,1906,1914,1922,1930,1938,1946,1954,1962,1970,1978,1986,1994,2002,2010,2018,2026,2034,2042,2050,2058,2066,2074,2082,2090,2098,2106,2114,2122,2130,2138,2146,2154,2162,2170,2178,2186,2194,2202,2210,2218,2226,2234,2242,2250,2258,2266,2274,2282,2290,2298,2306,2314,2322,2330,2338,2346,2354,2362,2370,2378,2386,2394,2402,2410,2418,2426,2434,2442,2450,2458,2466,2474,2482,2490,2498,2506,2514,2522,2530,2538,2546,2554,2562,2570,2578,2586,2594,2602,2610,2618,2626,2634,2642,2650,2658,2666,2674,2682,2690,2698,2706,2714,2722,2730,2738,2746,2754,2762,2770,2778,2786,2794,2802,2810,2818,2826,2834,2842,2850,2858,2866,2874,2882,2890,2898,2906,2914,2922,2930,2938,2946,2954,2962,2970,2978,2986,2994,3002,3010,3018,3026,3034,3042,3050,3058,3066,3074,3082,3090,3098,3106,3114,3122,3130,3138,3146,3154,3162,3170,3178,3186,3194,3202,3210,3218,3226,3234,3242,3250,3258,3266,3274,3282,3290,3298,3306,3314,3322,3330,3338,3346,3354,3362,3370,3378,3386,3394,3402,3410,3418,3426,3434,3442,3450,3458,3466,3474,3482,3490,3498,3506,3514,3522,3530,3538,3546,3554,3562,3570,3578,3586,3594,3602,3610,3618,3626,3634,3642,3650,3658,3666,3674,3682,3690,3698,3706,3714,3722,3730] //Used Kagerou
/* OBO  [522,530,538,546,554,562,570,578,586,594,602,610,618,626,634,642,650,658,666,674,682,690,698,706,714,722,730,738,746,754,762,770,778,786,794,802,810,818,826,834,842,850,858,866,874,882,890,898,906,914,922,930,958,976,994,1002,1014,1028,1046,1060,1082,1100]*/
];
var SP_COEFF = [
/* WL, SO, GE */
/* AB */
/* GX, RA, ME, RG, SU, SC, WA, MI */
/* RK */

/* RK */300,
/* GX */400,
/* AB */800,
/* RA */400,
/* WL */900,
/* ME */400,
/* RG */400,
/* SC */400,
/* SU */400,
/* MI */400,
/* WA */400,
/* SO */900,
/* GE */900,
/* KO */515
];
}

function calcSP( n_A_MaxSP )
{
	if ( thirdClass === 0 || n_A_JOB === cls_ENOVI )
	{ // Non-3rd class
		wSPSL = 0;
		if(n_A_JOB == cls_SL)
		{
			if(n_A_BaseLV >= 70)
			{
				if(n_A_BaseLV < 80)
					wSPSL = (n_A_BaseLV - 70) *4 +5;
				else if(n_A_BaseLV < 90)
					wSPSL = (n_A_BaseLV - 80) *4;
				else if(n_A_BaseLV < 93)
					wSPSL = (n_A_BaseLV - 90) *4;
				else if(n_A_BaseLV < 99)
					wSPSL = (n_A_BaseLV - 90) *4 -10;
				else wSPSL = 1;
			}
		}
		n_A_MaxSP = Math.floor(10 + n_A_BaseLV * JobSP_A[n_A_JOB] - wSPSL);
		if(n_A_JOB == cls_TKK && n_A_BaseLV >= 70)
		{
			if(n_A_BaseLV <=79)
				n_A_MaxSP = 150 + 1 * (n_A_BaseLV-70);
			else if(n_A_BaseLV <=89)
				n_A_MaxSP = 160 + 1 * (n_A_BaseLV-70);
			else if(n_A_BaseLV <=99)
			{
				n_A_MaxSP = 190;
				if(SkillSearch(skill_TK_TAEKWON_RANKER))
					n_A_MaxSP = n_A_MaxSP * 3;
				n_A_MaxSP = Math.floor(n_A_MaxSP);
			}
		}
		if(n_A_JOB == cls_TKM && n_A_BaseLV >= 70)
		{
			if(n_A_BaseLV <=79)
				n_A_MaxSP = 339 + 2 * (n_A_BaseLV-70);
			else if(n_A_BaseLV <=89)
				n_A_MaxSP = 386 + 2 * (n_A_BaseLV-80);
			else if(n_A_BaseLV <=99)
				n_A_MaxSP = 430 + 3 * (n_A_BaseLV-90);
		}
		if(n_A_JOB == cls_NIN)
		{
			if(n_A_BaseLV <= 20) n_A_MaxSP = 11 + n_A_BaseLV * 3;
			else if(n_A_BaseLV <= 40) n_A_MaxSP = 71 +(n_A_BaseLV-20)*4;
			else if(n_A_BaseLV <= 60) n_A_MaxSP = 151 +(n_A_BaseLV-40)*5;
			else if(n_A_BaseLV <= 80) n_A_MaxSP = 251 +(n_A_BaseLV-60)*6;
			else n_A_MaxSP = 370 +(n_A_BaseLV-80)*8;
		}
		if(n_A_JOB == cls_GUN)
		{
			if(n_A_BaseLV <= 25) n_A_MaxSP = 10 + n_A_BaseLV * 3;
			else if(n_A_BaseLV <= 35) n_A_MaxSP = 85 +(n_A_BaseLV-25)*4;
			else if(n_A_BaseLV <= 40) n_A_MaxSP = 126 +(n_A_BaseLV-35)*3;
			else if(n_A_BaseLV <= 50) n_A_MaxSP = 141 +(n_A_BaseLV-40)*4;
			else if(n_A_BaseLV <= 75) n_A_MaxSP = 181 +(n_A_BaseLV-50)*5;
			else if(n_A_BaseLV <= 78) n_A_MaxSP = 306 +(n_A_BaseLV-75)*6;
			else n_A_MaxSP = 330 +(n_A_BaseLV-78)*6;
		}
		if (n_A_JOB === cls_KAGOB) {
                    n_A_MaxSP = JobSP_Third[13][n_A_BaseLV - 99];
                }
	}
	else
	{ // 3rd Class
		n_A_MaxSP = JobSP_Third[Math.floor( n_A_JOB / 2 ) - 23][n_A_BaseLV - 99];
	}
	if ( rebirthClass )
	{ // Rebirth
		n_A_MaxSP = Math.floor(n_A_MaxSP * 125 /100);
	}
	if ( n_A_Adopted )
	{ // Adopted
		n_A_MaxSP = Math.floor(n_A_MaxSP *70 /100);
	}
	n_A_MaxSP = Math.floor(n_A_MaxSP * (100 + n_A_INT) / 100);

	// Flat Additions -------------------------
	w=0;

	w += n_tok[bon_SP_ADD];
	w += StPlusCalc2(bon_INT);
	w += StPlusCalc2(bon_ALL_STATS);

	// Cards
	if(n_A_JobSearch()==cls_MAG)
	{ // MageCls
		w += 100 * CardNumSearch(card_HEAD_BANSHEE); // Banshee
		w += 100 * CardNumSearch(476); // Agav
	}
	if(n_A_HEAD_DEF_PLUS <= 4 && n_A_card[card_loc_HEAD_UPPER]==179) // Blue Acidus
		w += 40;
	if(n_A_card[card_loc_HEAD_MIDDLE]==179) // Blue Acidus
		w += 40;
	if(n_A_HEAD_DEF_PLUS >= 9 && n_A_card[card_loc_HEAD_UPPER] == 298) // Carat
		w += 150;

	// Equipment
	if ( EquipNumSearch( 536 ) )
	{ // ValkShoes
		jobClass = n_A_JobSearch();
		if ( jobClass === cls_SWO ||
			 jobClass === cls_THI ||
			 jobClass === cls_MER )
		{
			w += 2 * n_A_JobLV;
		}
	}
	if ( n_A_Weapon_ATKplus >= 9 && EquipNumSearch(642))
	{ // LBW
		w += 300;
	}
	if ( EquipNumSearch( 762 ) )
	{
		w += 5 * n_A_BaseLV;
	}
	if ( EquipNumSearch( 770 ) )
	{ // Quill + Small Book Pen
		w += n_A_JobLV;
	}
	if ( EquipNumSearch( 859 ) )
	{ // Brynhild
		w += n_A_BaseLV *5;
	}
	if ( EquipNumSearch( 883 ) && n_A_BaseLV <= 79 )
	{ // Badge Academy
		w += 200 * EquipNumSearch(883);
	}
	if ( EquipNumSearch(986) )
	{ // Chameleon
		w += Math.floor(0.5 * n_A_BaseLV);
	}
	if ( EquipNumSearch( 1118 ) && n_A_JobSearch() == cls_ACO )
	{ // AcolyteFigurine
		w += 50;
	}
	if ( n_A_Weapon_ATKplus >= 6 && EquipNumSearch( 1168 ) )
	{ // Withered Branch Staff
		w += -100;
	}
	if ( EquipNumSearch( 1193 ) )
	{ // Proxy Skin Fragment
		w += Math.floor(n_A_BaseLV / 3) + n_A_SHOULDER_DEF_PLUS * 10;
	}
	if ( EquipNumSearch( 1172 ) && n_A_Weapon_ATKplus > 0 )
	{ // Kronos
		var kronosMod = Math.floor(n_A_Weapon_ATKplus / 2);
		w += 50 * kronosMod;
	}
	if ( EquipNumSearch( 1370 ) )
	{ // Sigrun's Wings
		if ( n_A_JobSearch() == cls_NOV )
		{ // Novices
			w += 30;
		}
	}
	if ( EquipNumSearch( 1475 ) )
	{ // WoE Robe
		if (n_A_BODY_DEF_PLUS >= 9) { w += 100; }
	}

	// Skills
	if ( SkillSearch( skill_SL_KAINA ) )
	{
		w += 30 * SkillSearch( skill_SL_KAINA );
	}
	if ( SkillSearch( skill_RAN_RESEARCH_TRAP ) )
	{
		w += ( 200 + 20 * SkillSearch( skill_RAN_RESEARCH_TRAP ) );
	}
	if ( SkillSearch( skill_MIWA_VOICE_LESSONS ) )
	{
		w += 30 * SkillSearch( skill_MIWA_VOICE_LESSONS );
	}

	n_A_MaxSP += w;
	n_A_MaxSP = Max(0,n_A_MaxSP);

	// Multipliers ---------------
	var spMultiplier = 0;

	spMultiplier += n_tok[bon_SP_MUL];

	// Cards
	if ( n_A_SHOES_DEF_PLUS >= 9 && CardNumSearch( 304 ) )
	{ // Firelock Soldier
		spMultiplier += 10;
	}
	if ( CardNumSearch( 405 ) )
	{ // Aliot
		if ( n_A_JobSearch() == cls_ACO ||
			 n_A_JobSearch() == cls_ARC ||
			 n_A_JobSearch() == cls_MAG )
		{
			spMultiplier += 5;
		}
	}

	// Equipment
	if ( n_A_SHOES_DEF_PLUS <= 4 && CardNumSearch( 407 ) )
	{ // Gold Acidus
		spMultiplier += 4;
	}
	if ( EquipNumSearch( 715 ) )
	{ // Variant Shoes
		spMultiplier -= n_A_SHOES_DEF_PLUS;
	}
	if ( EquipNumSearch( 1524 ) && n_A_HEAD_DEF_PLUS >= 1)
	{ // Turkey On Your Head
		spMultiplier += n_A_HEAD_DEF_PLUS;
	}
	if ( EquipNumSearch( 1525 ) && n_A_HEAD_DEF_PLUS >= 7)
	{ // Sweet Valentine
		spMultiplier += 4;
		if (n_A_HEAD_DEF_PLUS == 8) { spMultiplier += 1; }
		else if (n_A_HEAD_DEF_PLUS == 9) { spMultiplier += 2; }
		else if (n_A_HEAD_DEF_PLUS >= 10) { spMultiplier += 3; }
	}

	// Skills
	if ( SkillSearch( skill_SUR_RISING_DRAGON ) )
	{ // Rising Dragon
		spMultiplier += 2 + SkillSearch( skill_SUR_RISING_DRAGON );
	}
	if ( SkillSearch( skill_HP_MEDIATIO ) )
	{ // Meditatio
		spMultiplier += SkillSearch(skill_HP_MEDIATIO);
	}
	if ( SkillSearch( skill_HW_SOUL_DRAIN ) )
	{ // Soul Drain
		spMultiplier += SkillSearch( skill_HW_SOUL_DRAIN ) * 2;
	}
	if ( battleChantBuffs[pass_V_SP] )
	{ // Battle Chant
		spMultiplier += 100;
	}
	if ( performerBuffs[ksDancerSolo] === ksGypsysKiss && performerBuffs[ksDancerSoloLevel] > 0 )
	{ // Gypsy's Kiss
		var skillBonus = 15 + performerBuffs[ksDancerSoloLevel];
		var danceLessonsBonus = Math.floor( performerBuffs[ksDanceLessons] / 2 );
		var intBonus = Math.floor( performerBuffs[ksDancerInt] / 10 );
		spMultiplier += skillBonus + danceLessonsBonus + intBonus;
	}

	// Items
	if ( usableItems[ksVitataFiveHundred] )
	{
		spMultiplier += 5;
	}
	if ( usableItems[ksIncreaseSP] > 0 )
	{
		var modifier = 0;

		if ( usableItems[ksIncreaseSP] === 1 )
		{
			modifier = -5;
		}
		else if ( usableItems[ksIncreaseSP] === 3 )
		{
			modifier = 5;
		}
		spMultiplier += ( n_A_BaseLV / 10 ) + modifier;
	}


	n_A_MaxSP = Math.floor( n_A_MaxSP * ( 100 + spMultiplier ) / 100 );

	return n_A_MaxSP;
}

function calcHardDef( n_A_totalDEF )
{
	n_A_DEF = n_tok[bon_DEF];

	for(i=2;i<=10;i++)
		n_A_DEF += ItemOBJ[n_A_Equip[i]][itm_DEF];

	n_A_DEFplus = n_A_HEAD_DEF_PLUS + n_A_BODY_DEF_PLUS + n_A_LEFT_DEF_PLUS + n_A_SHOULDER_DEF_PLUS + n_A_SHOES_DEF_PLUS;

	// +5 gives additional def, +9 further, +13 further, +17 further
	n_A_DEFplus += Max(0,n_A_HEAD_DEF_PLUS-4) + Max(0,n_A_BODY_DEF_PLUS-4) + Max(0,n_A_LEFT_DEF_PLUS-4) + Max(0,n_A_SHOULDER_DEF_PLUS-4) + Max(0,n_A_SHOES_DEF_PLUS-4);
	n_A_DEFplus += Max(0,n_A_HEAD_DEF_PLUS-8) + Max(0,n_A_BODY_DEF_PLUS-8) + Max(0,n_A_LEFT_DEF_PLUS-8) + Max(0,n_A_SHOULDER_DEF_PLUS-8) + Max(0,n_A_SHOES_DEF_PLUS-8);
	n_A_DEFplus += Max(0,n_A_HEAD_DEF_PLUS-12) + Max(0,n_A_BODY_DEF_PLUS-12) + Max(0,n_A_LEFT_DEF_PLUS-12) + Max(0,n_A_SHOULDER_DEF_PLUS-12) + Max(0,n_A_SHOES_DEF_PLUS-12);
	n_A_DEFplus += Max(0,n_A_HEAD_DEF_PLUS-16) + Max(0,n_A_BODY_DEF_PLUS-16) + Max(0,n_A_LEFT_DEF_PLUS-16) + Max(0,n_A_SHOULDER_DEF_PLUS-16) + Max(0,n_A_SHOES_DEF_PLUS-16);

	if(n_A_LEFT_DEF_PLUS <= 5 && CardNumSearch(222)) // Arclouze
		n_A_DEF += 2;
	if(n_A_BODY_DEF_PLUS <= 5 && CardNumSearch(283)) // Goat
		n_A_DEF += 2;
	if(n_A_BODY_DEF_PLUS >= 12 && CardNumSearch(519)) // Hardrock Mammoth
		n_A_DEF += 20;

	if (otherBuffs[ksOdinsPower] >= 1) { //Odin's Power
		n_A_DEF -= 20;
	}

	if(EquipNumSearch(521)){ // Lunar Bow
		if(n_A_Weapon_ATKplus <= 5)
			n_A_DEF += 2;
		else if(n_A_Weapon_ATKplus >= 9)
			n_A_DEF += 7;
		else
			n_A_DEF += 5;
	}
	if(EquipNumSearch(658)) // Gatekeeper-DD
		n_A_DEF += n_A_Weapon_ATKplus;
	if(EquipNumSearch(715)) // Variant Shoes
		n_A_DEF += Math.floor(n_A_SHOES_DEF_PLUS /2);
	if(EquipNumSearch(742) && n_A_JobSearch()==cls_SWO) // Set ?
		n_A_DEF += 6;
	if(EquipNumSearch(764)) // Set ?
		n_A_DEFplus -= (n_A_HEAD_DEF_PLUS + n_A_LEFT_DEF_PLUS);
	if(EquipNumSearch(809)) // Leaf Hat
		n_A_DEFplus -= n_A_HEAD_DEF_PLUS;
	if(EquipNumSearch(942)) // Cardo
		n_A_DEF += Math.floor(n_A_Weapon_ATKplus / 2);;
	if(EquipNumSearch(986) && (n_A_JobSearch()==cls_SWO || n_A_JobSearch()==cls_THI || n_A_JobSearch()==cls_MER)) // Chameleon Armor
		n_A_DEF += 3;
	if(EquipNumSearch(987) && (EquipNumSearch(616) || EquipNumSearch(617) || EquipNumSearch(618))) // SprintMail / Set
		n_A_DEF += 2;
	if(EquipNumSearch(1026)) // Santa Beard
		n_A_DEF -= 5;
	if(EquipNumSearch(1117) && n_A_JobSearch()==cls_SWO) // Swordsman Figurine
		n_A_DEF += 2;
	if(SU_INT >= 120 && EquipNumSearch(1264)) // Reissue Schmitz Helm
		n_A_DEF += 5;
	if ( EquipNumSearch( 872 ) )
	{ // Crown of Deceit
		if ( n_A_HEAD_DEF_PLUS >= 7 )
		{
			n_A_DEF += 5;
		}
	}
	if ( EquipNumSearch( 1336 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Aquarius Diadem
		n_A_DEF += 1;
	}
	if ( EquipNumSearch( 1337 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Aries Diadem
		n_A_DEF += 1;
	}
	if ( EquipNumSearch( 1346 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Taurus Diadem
		n_A_DEF += 2;
	}
	if ( EquipNumSearch( 1349 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Cancer Crown
		n_A_DEF += 1;
	}
	if ( EquipNumSearch( 1356 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Taurus Crown
		n_A_DEF += 2;
	}
	if ( EquipNumSearch( 1351 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Leo Crown
		n_A_DEF += 1;
	}i
	if(EquipNumSearch(1546))
	{ // Enhanced Variant Shoes
		n_A_DEF += Math.floor(n_A_SHOES_DEF_PLUS /2);
	}

	// Skills
	if ( performerBuffs[ksEnsemble] === ksBattleTheme && performerBuffs[ksEnsembleLevel] > 0 )
	{ // Battle Theme
		n_A_DEF += 10 * performerBuffs[ksEnsembleLevel];
	}
	if ( SkillSearch( skill_MEC_MAINFRAME_RESTRUCTURE ) )
	{ // Remodel Mainframe
		n_A_DEF += 20 + 20 * SkillSearch( skill_MEC_MAINFRAME_RESTRUCTURE );
	}
	if ( SkillSearch( skill_ROY_SHIELD_SPELL ) === 3 )
	{ // shield sell DEF increase: [(Shield Upgrade x 10) x (Caster’s Base Level / 100)]
		n_A_DEF += Math.floor( ( n_A_LEFT_DEF_PLUS * 10 ) * n_A_BaseLV / 100.0 );
	}
	if ( SkillSearch( skill_ROY_PRESTIGE ) )
	{ // Prestige DEF increase: [{(Skill Level x 15) + (Defending Aura Skill Level x 10)} x Caster’s Base Level / 100]
		n_A_DEF += Math.floor( ( ( SkillSearch( skill_ROY_PRESTIGE ) * 15 ) + ( SkillSearch( skill_CR_DEFENDING_AURA ) * 10 ) ) * n_A_BaseLV / 100.0 );
	}
	if ( SkillSearch(skill_ROY_BANDING ) )
	{ // Banding DEF increase: [# of Royal Guard party members x (5 + 1 * Skill Level)]
		n_A_DEF += ( 5 + SkillSearch( skill_ROY_BANDING ) ) * SkillSearch( skill_ROY_NUM_GUARDS );
	}
	if ( SkillSearch( skill_RUN_STONEHARD_SKIN ) )
	{ // Hagalaz Rune
		n_A_DEF += Math.floor( n_A_JobLV * SkillSearch( skill_RUN_RUNE_MASTERY ) / 4 );
	}

	// Total Physical Defense
	n_A_totalDEF = n_A_DEF + n_A_DEFplus;

	// Multipliers-----------------
	if(n_tok[bon_USR_DEF_DIV])
		n_A_totalDEF = Math.floor(n_A_totalDEF / n_tok[bon_USR_DEF_DIV]);
	if(n_tok[bon_DEF_MUL]) // ?
		n_A_totalDEF -= Math.floor(n_A_totalDEF * n_tok[bon_DEF_MUL] /100);
	if(miscEffects[ksPoisoned])
		n_A_totalDEF -= Math.floor(n_A_totalDEF * 25 / 100);

	var defenseMultiplier = 0;

	if ( SkillSearch( skill_LK_SPEAR_DYNAMO ) )
	{ // Spear Dynamo
		defenseMultiplier += -1 * 0.05 * SkillSearch( skill_LK_SPEAR_DYNAMO );
	}
	if ( acolyteBuffs[ksAssumptio] )
	{ // Assumptio
		defenseMultiplier += 1;
	}
	if ( SkillSearch( skill_ROY_FORCE_OF_VANGUARD ) )
	{ // Vanguard Force
		defenseMultiplier += 0.02 * SkillSearch( skill_ROY_FORCE_OF_VANGUARD );
	}
	if ( performerBuffs[ksMaestroSolo] === ksEchoSong && performerBuffs[ksMaestroSoloLevel] > 0 )
	{ // Echo Song
		var skillBonus = performerBuffs[ksMaestroSoloLevel] * 6;
		var voiceLessonsBonus = performerBuffs[ksMaestroVoiceLessons];
		var jobLvlBonus = performerBuffs[ksMaestroJobLevel] / 4.0;

		defenseMultiplier += ( skillBonus + voiceLessonsBonus + jobLvlBonus ) / 100;
	}
	if ( performerBuffs[ksChorus] === ksSaturdayNightFever &&
		 performerBuffs[ksChorusLevel] > 0 &&
		 performerBuffs[ksNumPerformers] >= 2 )
	{ // Saturday Night Fever
		var skillBonus = 0.1 + 0.1 * performerBuffs[ksChorusLevel];

		defenseMultiplier -= skillBonus;
	}

	if ( CardNumSearch( 392 ) )
	{ // Tao Gunka
		defenseMultiplier -= 0.5;
	}
	// Apply multipliers
	n_A_totalDEF *= ( 1 + defenseMultiplier );

	// Reduction per enemy
	if ( miscEffects[ksNumEnemies] >= 3 )
	{
		n_A_totalDEF -= Math.floor( n_A_totalDEF * ( miscEffects[ksNumEnemies] - 2 ) * 5 / 100 );
	}

	// Frenzy just removes all DEF
	if ( SkillSearch( skill_LK_FRENZY ) )
	{
		n_A_totalDEF = 0;
	}
	if ( SkillSearch( skill_RAN_CAMOUFLAGE ) )
	{ // Camouflage
		n_A_totalDEF = 0;
	}

	n_A_totalDEF = Math.floor( n_A_totalDEF );

	return n_A_totalDEF;
}

function calcSoftDef( n_A_VITDEF )
{
	n_A_VITDEF = Math.floor((n_A_VIT / 2) + (n_A_BaseLV /2) + (n_A_AGI / 5));

	if(SkillSearch(skill_SW_BERSERK))
	{ // AutoBerserk
		n_A_VITDEF = Math.floor(n_A_VITDEF * 0.45);
	}
	else if(otherBuffs[ksProvoke])
	{
			n_A_VITDEF = Math.floor(n_A_VITDEF * (0.95 - 0.05 * otherBuffs[ksProvoke]));
	}
	else if(otherBuffs[ksAloe])
	{
			n_A_VITDEF = Math.floor(n_A_VITDEF * 0.9);
	}
	if ( SkillSearch( skill_SUR_GENTLE_TOUCH_REVITALIZE ) || acolyteBuffs[ksPPRevitalize] )
	{ // sura revitalize STAT DEF increase: [(Caster’s VIT / 4) x Skill Level]
		if ( SkillSearch( skill_SUR_GENTLE_TOUCH_REVITALIZE ) )
		{
			n_A_VITDEF += Math.floor( ( n_A_VIT / 4 ) * SkillSearch( skill_SUR_GENTLE_TOUCH_REVITALIZE ) );
		}
		else
		{
			n_A_VITDEF += Math.floor( ( acolyteBuffs[ksSuraVitality] / 4 ) * acolyteBuffs[ksPPRevitalize] );
		}
	}
	if(n_tok[bon_USR_DEF_DIV])
	{
		n_A_VITDEF = Math.floor(n_A_VITDEF / n_tok[bon_USR_DEF_DIV]);
	}
	if(acolyteBuffs[ksAngelus])
	{
		n_A_VITDEF = Math.floor(n_A_VITDEF * (1 + 0.05 * acolyteBuffs[ksAngelus]));
	}
	if(miscEffects[ksNumEnemies] >= 3)
		n_A_VITDEF -= Math.floor(n_A_VITDEF * (miscEffects[ksNumEnemies] - 2) * 5 / 100);

	if(TimeItemNumSearch(temp_MMMANT))
		n_A_VITDEF -= Math.floor(n_A_VITDEF * 20 / 100);

	if(miscEffects[ksPoisoned])
		n_A_VITDEF -= Math.floor(n_A_VITDEF * 25 / 100);
	if(SkillSearch(skill_LK_SPEAR_DYNAMO)) // Spear Dynamo
		n_A_VITDEF = Math.floor(n_A_VITDEF * (1 - 0.05 * SkillSearch(skill_LK_SPEAR_DYNAMO)));
	if(SkillSearch(skill_LK_FRENZY)) // Berserk
		n_A_VITDEF = 0;
	if ( acolyteBuffs[ksAssumptio] )
	{ // Assumptio
		n_A_VITDEF *= 1;
	}

	return n_A_VITDEF;
}

function calcHardMDef(n_A_MDEF)
{
	n_A_MDEF = n_tok[bon_MDEF];

	// Card modifiers
	if(CardNumSearch(199) && n_A_JobSearch()==cls_MAG) // Frus
		n_A_MDEF += 3;
	if(n_A_HEAD_DEF_PLUS <= 5 && n_A_card[card_loc_HEAD_UPPER] == 213) // Gibbet
		n_A_MDEF += 5;
	if(n_A_card[card_loc_HEAD_MIDDLE] == 213) // Gibbet
		n_A_MDEF += 5;
	if(n_A_LEFT_DEF_PLUS <= 5 && CardNumSearch(222)) // Arclouse
		n_A_MDEF += 3;
	if(n_A_SHOULDER_DEF_PLUS <= 5 && CardNumSearch(258)) // Kappa
		n_A_MDEF += 8;
	if(n_A_BODY_DEF_PLUS <= 5 && CardNumSearch(283)) // Goat
		n_A_MDEF += 5;
	if(n_A_LEFT_DEF_PLUS >= 9 && CardNumSearch(310)) // Sting
		n_A_MDEF += 5;
	if(n_A_SHOES_DEF_PLUS <= 5 && CardNumSearch(381)) // Megalith
		n_A_MDEF += 7;
	if(n_A_JobSearch()==cls_ACO) // AcolyteCls
		n_A_MDEF += CardNumSearch(383); // RideWord

	if (otherBuffs[ksOdinsPower] >= 1) { //Odin's Power
		n_A_MDEF -= 20;
	}
	// Equipment modifiers
	if ( EquipNumSearch( 872 ) )
	{ // Crown of Deceit
		if ( n_A_HEAD_DEF_PLUS >= 9 )
		{
			n_A_MDEF += 5;
		}
	}
	if ( EquipNumSearch( 1337 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Aries Diadem
		n_A_MDEF += 5;
	}
	if ( EquipNumSearch( 1338 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Cancer Diadem
		n_A_MDEF += 1;
	}
	if ( EquipNumSearch( 1340 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Gemini Diadem
		n_A_MDEF += 7;
	}
	if ( EquipNumSearch( 1348 ) && n_A_HEAD_DEF_PLUS >= 10 )
	{ // Aries Crown
		n_A_MDEF += 5;
	}
	if ( EquipNumSearch( 1353 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Pisces Crown
		n_A_MDEF += 5;
	}
	if ( EquipNumSearch(764))
	{ // VShield + Odin + Fricca
		n_A_MDEF += (n_A_HEAD_DEF_PLUS + n_A_LEFT_DEF_PLUS);
	}
	if ( EquipNumSearch(809))
	{ // LeafHat
		n_A_MDEF += n_A_HEAD_DEF_PLUS;
	}
	if ( EquipNumSearch(986) && (n_A_JobSearch()==cls_ACO || n_A_JobSearch()==cls_ARC || n_A_JobSearch()==cls_MAG))
	{ // Chameleon Armor
		n_A_MDEF += 5;
	}
	if ( EquipNumSearch(1169))
	{ // LacrimaStick
		n_A_MDEF += n_A_Weapon_ATKplus;
	}

	// Skill modifiers
	if ( SkillSearch( skill_SW_ENDURE ) )
	{ // Endure
		n_A_MDEF += SkillSearch( skill_SW_ENDURE );
	}
	else if ( SkillSearch( skill_LK_SPEAR_DYNAMO ) )
	{ // Spear Dynamo
		n_A_MDEF += 1;
	}
	if ( SkillSearch( skill_RUN_STONEHARD_SKIN ) )
	{ // Hagalaz Rune
		n_A_MDEF += Math.floor( n_A_JobLV * SkillSearch( skill_RUN_RUNE_MASTERY ) / 4 );
	}
	if ( SkillSearch( skill_SUR_GENTLE_TOUCH_CHANGE ) || acolyteBuffs[ksPPChange] > 0 )
	{ // Gentle Touch Convert: MDEF decrease: MDEF [(200 / Caster’s INT) x Skill Level]
		if ( SkillSearch( skill_SUR_GENTLE_TOUCH_CHANGE ) )
		{
			n_A_MDEF -= Math.floor( ( 200 / n_A_INT ) * SkillSearch( skill_SUR_GENTLE_TOUCH_CHANGE ) );
		}
		else
		{
			n_A_MDEF -= Math.floor( ( 200 / acolyteBuffs[ksSuraIntelligence] ) * acolyteBuffs[ksPPChange] );
		}
	}

	// Multipliers-----------------
	var mdefMultiplier = 0;

	if ( acolyteBuffs[ksAssumptio] )
	{
		mdefMultiplier += 1;
	}
	if ( CardNumSearch( 392 ) )
	{ // Tao Gunka
		mdefMultiplier -= 0.5;
	}
	if ( performerBuffs[ksWandererSolo] === ksLoversSymphony && performerBuffs[ksWandererSoloLevel] > 0 )
	{ //Lover's Symphony
		var skillBonus = performerBuffs[ksWandererSoloLevel] * 12;
		var voiceLessonsBonus = performerBuffs[ksWandererVoiceLessons];
		var jobLvlBonus = performerBuffs[ksWandererJobLevel] / 4.0;

		mdefMultiplier += ( skillBonus + voiceLessonsBonus + jobLvlBonus ) / 100;
	}

	// Apply multipliers
	n_A_MDEF *= ( 1 + mdefMultiplier );

	if ( SkillSearch( skill_LK_FRENZY ) )
	{ // Berserk
		n_A_MDEF = 0;
	}

	return n_A_MDEF;
}

function calcSoftMDef( n_A_INTMDEF )
{
	n_A_INTMDEF = Math.floor( n_A_INT + ( n_A_VIT / 5 ) + ( n_A_DEX / 5 ) + ( n_A_BaseLV / 4 ) );

	if ( TimeItemNumSearch( temp_ULFHEDINN ) )
	{
		n_A_INTMDEF -= Math.floor( n_A_INTMDEF * 20 / 100 );
	}
	if ( acolyteBuffs[ksAssumptio] )
	{ // Assumptio
		n_A_INTMDEF *= 1;
	}

	return n_A_INTMDEF;
}

function calcHit(n_A_HIT)
{
	n_A_HIT = 175 + n_A_BaseLV + n_A_DEX + Math.floor(n_A_LUK / 3);

	n_A_HIT += n_tok[bon_HIT];

	// Cards
	if(n_A_WeaponType==weapTyp_SWORD || n_A_WeaponType==weapTyp_SWORDII) // Sword 2hS
		n_A_HIT += CardNumSearch(464) * 5; // Sword Guardian
	if(n_A_WeaponType==weapTyp_BOW) // Bow
		n_A_HIT += CardNumSearch(465) * 5; // Bow Guardian
	if(CardNumSearch(492)) // Ifrit
		n_A_HIT += Math.floor(n_A_JobLV /10) * CardNumSearch(492);

	// Equipment
	if ( EquipNumSearch( 442 ) && SU_STR >= 90 )
	{ // Rogue's Treasure
		n_A_HIT += 10 * EquipNumSearch( 442 );
	}
	if ( EquipNumSearch( 1381 ) )
	{ // Agent Katar
		n_A_HIT += Math.floor(n_A_LUK/2);
	}
	if ( EquipNumSearch( 1261 ) && SU_STR >= 120 )
	{ // Burning Spirit
		n_A_HIT += 3;
	}
	if ( EquipNumSearch( 1167 ) && SU_STR >= 95 )
	{ // Giant Axe
		n_A_HIT += 10;
	}
	if ( EquipNumSearch(1176) && SkillSearch(skill_AS_KATAR_MASTERY) === 10 )
	{ // Chakram
		n_A_HIT += 10;
	}
	if ( EquipNumSearch( 654 ) )
	{ // Western Outlaw
		n_A_HIT += Math.floor( SU_AGI / 10 );
	}
	if ( EquipNumSearch( 656 ) )
	{ // Jungle Carbine
		n_A_HIT -= Math.floor( SU_DEX / 3 );
	}

	// Skills
	n_A_HIT += 1 * SkillSearch(skill_AR_VULTURES_EYE);
	n_A_HIT += 10 * SkillSearch(skill_LK_SPEAR_DYNAMO);
	n_A_HIT += 3 * SkillSearch(skill_SN_FALCON_EYES);
	n_A_HIT += 2 * SkillSearch(skill_GS_SINGLE_ACTION);
	n_A_HIT += 1 * SkillSearch(skill_GS_SNAKE_EYES);
	if ( SkillSearch( skill_GS_GUNSLINGER_PANIC ) )
	{
		n_A_HIT -= 30;
	}
	if ( SkillSearch( skill_GS_INCREASE_ACCURACY ) )
	{
		n_A_HIT += 20;
	}
	if ( SkillSearch( skill_MEC_AXE_TRAINING ) )
	{ // axe mastery
		if ( n_A_WeaponType == weapTyp_AXE || n_A_WeaponType == weapTyp_AXEII )
		{ // axe weapon
			n_A_HIT += 3 * SkillSearch( skill_MEC_AXE_TRAINING );
		}
		if ( n_A_WeaponType == weapTyp_MACE )
		{ // mace weapon
			n_A_HIT += 2 * SkillSearch( skill_MEC_AXE_TRAINING );
		}
	}
	if ( SkillSearch( skill_ROY_INSPIRATION ) )
	{ // Inspiration [Skill Level x 5 ] + [Caster’s Job Level / 2 ]
		n_A_HIT += Math.floor( ( 5 * SkillSearch( skill_ROY_INSPIRATION ) ) + ( n_A_JobLV / 2 ) );
	}
	if ( n_A_ActiveSkill === skill_PA_RAPID_SMITING )
	{ // Rapid Smiting
		n_A_HIT += 20;
	}
	if ( battleChantBuffs[pass_V_HIT_FLEE] )
	{
		n_A_HIT += 50;
	}
	if ( performerBuffs[ksDancerSolo] === ksFocusBallet && performerBuffs[ksDancerSoloLevel] > 0 )
	{ // Focus Ballet
		var skillBonus = 10 + performerBuffs[ksDancerSoloLevel] * 2;
		var danceLessonsBonus = performerBuffs[ksDanceLessons];
		var dexBonus = Math.floor( performerBuffs[ksDancerDex] / 10 );
		n_A_HIT += skillBonus + danceLessonsBonus + dexBonus;
	}
	if ( SkillSearch( skill_GEN_CART_REMODELING ) )
	{ // Cart remodeling
		n_A_HIT += 4 * SkillSearch( skill_GEN_CART_REMODELING );
	}
	if ( SkillSearch( skill_GLT_VENOM_PRESSURE ) )
	{ // Venom Pressure
		n_A_HIT += 10 + 4 * SkillSearch( skill_GLT_VENOM_PRESSURE );
	}

	// Items
	if ( usableItems[ksSesamePastry] )
	{
		n_A_HIT += 30;
	}
	if ( usableItems[ksMilitaryRationB] )
	{
		n_A_HIT += 33;
	}
	if ( usableItems[ksBoucheDeNoel] )
	{
		n_A_HIT += 3;
	}
	if ( usableItems[ksSchwartzwaldPineJubilee] )
	{
		n_A_HIT += 10;
	}

	return n_A_HIT;
}

function calcFlee( n_A_FLEE )
{
	n_A_FLEE = 100 + n_A_BaseLV + n_A_AGI + Math.floor(n_A_LUK / 5);

	n_A_FLEE += n_tok[bon_FLEE];

	if(n_A_SHOULDER_DEF_PLUS >= 9 && CardNumSearch(271)) // NineTail
		n_A_FLEE += 20;
	if(n_A_JobSearch()==cls_THI && CardNumSearch(295)) // Wanderer
		n_A_FLEE += 20;
	if(n_A_SHOULDER_DEF_PLUS <= 4 && CardNumSearch(401)) // KavachIcarus
		n_A_FLEE += 10;
	if(n_A_SHOULDER_DEF_PLUS >= 9 && CardNumSearch(403)) // OrcBaby
		n_A_FLEE += 5;

	if ( SU_STR >= 90 && EquipNumSearch( 442 ) )
	{ // Rogue's Treasure
		n_A_FLEE += 10 * EquipNumSearch( 442 );
	}
	if(n_A_Equip[0]==483) // Bloody Roar
		n_A_FLEE -= (n_A_BaseLV + SU_AGI);
	if(SU_AGI >= 120 && EquipNumSearch(1257)) // Shadow Crown
		n_A_FLEE += 3;
	if(SU_INT >= 120 && EquipNumSearch(1263)) // Whispers of Wind
		n_A_FLEE += 3;
	if ( EquipNumSearch( 1341 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Leo Diadem
		n_A_FLEE += 10;
	}
	if ( EquipNumSearch( 1342 ) && n_A_HEAD_DEF_PLUS >= 9 )
	{ // Libra Diadem
		n_A_FLEE += 5;
	}
	if ( EquipNumSearch( 1349 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Cancer Crown
		n_A_FLEE += 10;
	}
	if ( EquipNumSearch( 1351 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Leo Crown
		n_A_FLEE += 10;
	}
	if ( EquipNumSearch( 1408 ) )
	{ // White Wing Suit
		n_A_FLEE += n_A_BODY_DEF_PLUS;
	}
	if ( EquipNumSearch( 1475 ) )
	{ // WoE Robe
		if (n_A_BODY_DEF_PLUS >= 6) { n_A_FLEE += 5; }
	}

	if(n_A_JobSearch2() == cls_ASS || n_A_JobSearch2() == cls_ROG)
		n_A_FLEE += 4 * SkillSearch(skill_TH_IMPROVE_DODGE);
	else
		n_A_FLEE += 3 * SkillSearch(skill_TH_IMPROVE_DODGE);
	if(SkillSearch(skill_GLT_HALLUCINATION_WALK))
		n_A_FLEE += 50 * SkillSearch(skill_GLT_HALLUCINATION_WALK);

	Mikiri = new Array(0,1,3,4,6,7,9,10,12,13,15);
	n_A_FLEE += Mikiri[SkillSearch(skill_MO_FLEE)];
	if(SkillSearch(skill_LK_BERSERK))
		n_A_FLEE /= 2;
	if(n_A_JOB == cls_SNI || n_A_JOB == cls_RAN || n_A_JOB == cls_RANt)
		n_A_FLEE += Math.round(SkillSearch(skill_SN_WIND_WALK) /2);
	if(otherBuffs[ksWindWalker] && SkillSearch(skill_SN_WIND_WALK)==0)
		n_A_FLEE += Math.round(otherBuffs[ksWindWalker] /2);
	if(SkillSearch(skill_TKM_LUNAR_PROTECTION))
		n_A_FLEE += Math.floor((n_A_BaseLV + n_A_LUK + n_A_DEX) / 10);
	if(SkillSearch(skill_RG_CLOSE_CONFINE))
		n_A_FLEE += 10;
	if(SkillSearch(skill_GS_GUNSLINGER_PANIC))
		n_A_FLEE += 30;
	if(SkillSearch(skill_GS_GATLING_FEVER))
	{
		if(n_A_WeaponType==weapTyp_GATLING_GUN || n_A_WeaponType==weapTyp_NONE)
			n_A_FLEE -= 5 * SkillSearch(skill_GS_GATLING_FEVER);
	}

	if(otherBuffs[ksElementField] == ksWhirlwind && otherBuffs[ksElementFieldLvl] >= 1)
		n_A_FLEE += otherBuffs[ksElementFieldLvl] *3;
	if(battleChantBuffs[pass_V_HIT_FLEE])
		n_A_FLEE += 50;

	// Items
	if ( usableItems[ksHoneyPastry] )
	{
		n_A_FLEE += 30;
	}
	if ( usableItems[ksMilitaryRationC] )
	{
		n_A_FLEE += 33;
	}
	if ( usableItems[ksSchwartzwaldPineJubilee] )
	{
		n_A_FLEE += 20;
	}

	// Skills
	if ( performerBuffs[ksBardSolo] === ksPerfectTablature && performerBuffs[ksBardSoloLevel] > 0 )
	{ // Perfect Tablature
		var skillBonus = performerBuffs[ksBardSoloLevel];
		var musicLessonsBonus = Math.floor( performerBuffs[ksMusicLessons] / 2 );
		var agiBonus = Math.floor( performerBuffs[ksBardAgi] / 10 );
		n_A_FLEE += skillBonus + musicLessonsBonus + agiBonus;
	}
	if ( performerBuffs[ksWandererSolo] === ksGloomyShynessW && performerBuffs[ksWandererSoloLevel] > 0 )
	{ // Gloomy Shyness
		n_A_FLEE -= 20 + 5 * performerBuffs[ksWandererSoloLevel];
	}
	else if ( performerBuffs[ksMaestroSolo] === ksGloomyShynessM && performerBuffs[ksMaestroSoloLevel] > 0 )
	{ // Gloomy Shyness
		n_A_FLEE -= 20 + 5 * performerBuffs[ksMaestroSoloLevel];
	}
	if ( ( n_A_WeaponType == weapTyp_SPEAR || n_A_WeaponType == weapTyp_2HSPEAR ) && SkillSearch( skill_CR_SPEAR_QUICKEN ) )
	{ // Spear Quicken
		n_A_FLEE += SkillSearch( skill_CR_SPEAR_QUICKEN ) * 2;
	}

	// Multipliers
	var fleeMultiplier = 1;

	if ( performerBuffs[ksChorus] === ksSaturdayNightFever &&
		 performerBuffs[ksChorusLevel] > 0 &&
		 performerBuffs[ksNumPerformers] >= 2 )
	{ // Saturday Night Fever
		var skillBonus = 0.4 + 0.1 * performerBuffs[ksChorusLevel];

		fleeMultiplier -= skillBonus;
	}

	// Apply multipliers
	n_A_FLEE = Math.floor( n_A_FLEE * fleeMultiplier );

	// Flee eaten by enemies
	if ( miscEffects[ksNumEnemies] >= 3 )
	{
		var w = miscEffects[ksNumEnemies] - 2;
		if ( w > 10 )
		{
			w = 10;
		}
		n_A_FLEE -= Math.floor(n_A_FLEE * w * 10 / 100);
	}

	return n_A_FLEE;
}

function calcPDodge( n_A_LUCKY )
{
	n_A_LUCKY = 1 + Math.floor(n_A_LUK / 10);

	n_A_LUCKY += n_tok[bon_PDODGE];

	if(n_A_JobSearch()==cls_SWO)
		n_A_LUCKY += 3 * CardNumSearch(354); // Heater
	if(n_A_JobSearch()==cls_THI)
		n_A_LUCKY += 5 * CardNumSearch(391); // WildRose
	if(n_A_SHOULDER_DEF_PLUS <= 4 && CardNumSearch(401)) // KavIcarus
		n_A_LUCKY += 1;

	if ( EquipNumSearch( 535 ) )
	{ // ValkMant
		var wHPVS = n_A_JobSearch();
		if(wHPVS==cls_ACO || wHPVS==cls_ARC || wHPVS==cls_MAG)
			n_A_LUCKY += 5+ n_A_SHOULDER_DEF_PLUS * 2;
	}
	if(n_A_JobSearch()==cls_TKK && EquipNumSearch(678)) // HahoeMask
		n_A_LUCKY += 2;
	if(SU_AGI >= 120 && EquipNumSearch(1262)) // Silent Enforcer
		n_A_LUCKY += 5;

	// Perfect Tablature
	if ( performerBuffs[ksBardSolo] === ksPerfectTablature && performerBuffs[ksBardSoloLevel] > 0 )
	{
		var skillBonus = Math.ceil( performerBuffs[ksBardSoloLevel] / 2 );
		//var musicLessonsBonus = Math.floor( performerBuffs[ksMusicLessons] / 2 );
		//var agiBonus = Math.floor( performerBuffs[ksBardAgi] / 10 );
		n_A_LUCKY += skillBonus;
	}

	n_A_LUCKY = Math.round( n_A_LUCKY * 10 ) / 10;

	return n_A_LUCKY;
}

function calcCrit( n_A_CRI )
{
	n_A_CRI = 1 + Math.floor( n_A_LUK / 3 );

	n_A_CRI += n_tok[bon_CRIT];
	w = n_tok[bon_CRIT_RC_FORMLESS+n_B[en_RACE]];

	// Card modifiers
	if(n_A_JobSearch()==cls_ACO)
	{
		if(n_B[en_RACE]==race_UNDEAD || n_B[en_RACE] == race_DEMON )
		{
			w += 9 * CardNumSearch(253); // FurSeal
		}
	}
	if(SU_LUK >= 80 && CardNumSearch(267)) // GiantWhisper
		n_A_CRI += 3;
	if(n_A_JobSearch()==cls_THI)
		n_A_CRI += 4 * CardNumSearch(328); // Mobster
	if(CardNumSearch(card_GRMT_GREENMAIDEN)) // GreenMaiden
		n_A_CRI += n_A_SHOULDER_DEF_PLUS;
	if(n_A_WeaponType==weapTyp_SWORDII || n_A_WeaponType==weapTyp_SWORD)
		n_A_CRI += CardNumSearch(464) * 5; // SwordGuardian
	if(n_A_WeaponType==weapTyp_BOW) // Bow
		n_A_CRI += CardNumSearch(465) * 5; // BowGuardian
	if(CardNumSearch(492)) // Ifrit
		n_A_CRI += Math.floor(n_A_JobLV /10) * CardNumSearch(492);
	if(CardNumSearch(515) && n_A_Weapon_ATKplus >= 14) // Tendrillion
		n_A_CRI += 10;

	// Equipment modifiers
	if ( SU_AGI >= 90 && EquipNumSearch( 442 ) )
	{ // Rogue's Treasure
		n_A_CRI += 10 * EquipNumSearch( 442 );
	}
	if(EquipNumSearch(623)) // HeartBreaker
		n_A_CRI += n_A_Weapon_ATKplus;
	if(EquipNumSearch(640)) // GiantEncyclopedia
		n_A_CRI += Math.floor(SU_LUK / 5);
	if(n_A_JobSearch()==cls_TKK && EquipNumSearch(675)) // BrideMask
		n_A_CRI += 5;
	if(EquipNumSearch(689)) // SnipingSuit
		n_A_CRI += Math.floor(SU_LUK / 10);
	if(n_A_HEAD_DEF_PLUS >= 6 && EquipNumSearch(785)) // DevilringHat
		n_A_CRI += (n_A_HEAD_DEF_PLUS -5);
	if(n_A_Weapon_ATKplus >= 6 && n_B[en_RACE]==race_DEMI_HUMAN && EquipNumSearch(1091)) // GlorJamadhar
		w += 5;
	if(EquipNumSearch(1122) && n_A_JobSearch()==cls_MER) // Merchant Figurine
		n_A_CRI += 5;
	if(EquipNumSearch(1161)) // VeteranHammer
		n_A_CRI += (2 * SkillSearch(skill_PR_MACE_MASTERY));
	if(SU_DEX >= 90 && EquipNumSearch(1164)) // BerchelAxe
		n_A_CRI += 5;
	if(SU_AGI >= 120 && EquipNumSearch(1200)) { // BradiumBrooch
		n_A_CRI += 4*EquipNumSearch(1200);
	}
	if ( SU_STR >= 120 && EquipNumSearch( 1256 ) )
	{ // Driver Band
		n_A_CRI += 3;
	}
	if ( EquipNumSearch( 1299 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Mercury Riser
		n_A_CRI += 2;
		if ( n_A_HEAD_DEF_PLUS >= 9 )
		{
			n_A_CRI += 2;
		}
	}
	if ( n_A_ActiveSkill != skill_SN_FOCUSED_ARROW_STRIKE )
	{
		if ( n_A_WeaponType == weapTyp_BOW && n_A_Arrow == arrTyp_SHARP )
		{
			n_A_CRI += 20;
		}
		if ( n_A_WeaponType == weapTyp_BOW || weapTyp_HANDGUN <= n_A_WeaponType && n_A_WeaponType<=weapTyp_GRENADE_LAUNCHER )
		{ // Drosera
			n_A_CRI += CardNumSearch( 462 ) * 15;
		}

		n_A_CRI += w;
	}
	if ( EquipNumSearch( 1361 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Black Cat (bRO) + Black Cat Tail
		n_A_CRI += 5;
	}
	if(EquipNumSearch(1514))
	{//Evil Marching Hat
		if (n_A_HEAD_DEF_PLUS >= 7) n_A_CRI += 10;
	}

	// Skill modifiers
	if ( SkillSearch(skill_MO_FURY ) )
	{
		n_A_CRI += 7.5 + SkillSearch(skill_MO_FURY) * 2.5;
	}
	else if ( TimeItemNumSearch( temp_ROFL ) )
	{
		n_A_CRI += 10;
	}
	if ( SkillSearch( skill_SN_FURY ) )
	{
		n_A_CRI += 50;
	}
	if ( ( n_A_WeaponType == weapTyp_SPEAR || n_A_WeaponType == weapTyp_2HSPEAR ) && SkillSearch( skill_CR_SPEAR_QUICKEN ) )
	{ // Spear Quicken
		n_A_CRI += SkillSearch( skill_CR_SPEAR_QUICKEN ) * 3;
	}
	n_A_CRI += SkillSearch( skill_SN_FALCON_EYES );

	// Items
	if ( usableItems[ksBoucheDeNoel] )
	{
		n_A_CRI += 7;
	}
	if ( usableItems[ksArunafeltzDesertSandwich] )
	{
		n_A_CRI += 7;
	}
	if ( usableItems[ksAbrasive] )
	{
		n_A_CRI += 30;
	}
	// Skills
	if ( performerBuffs[ksDancerSolo] === ksLadyLuck && performerBuffs[ksDancerSoloLevel] > 0 )
	{ // Lady Luck
		var skillBonus = 10 + performerBuffs[ksDancerSoloLevel];
		var danceLessonsBous = Math.floor( performerBuffs[ksDanceLessons] / 2 );
		var lukBonus = Math.floor( performerBuffs[ksDancerLuk] / 10 );
		n_A_CRI += skillBonus + danceLessonsBous + lukBonus;
	}
	if ( SkillSearch( skill_RAN_CAMOUFLAGE ) )
	{ // Camouflage
		n_A_CRI += 100;
	}
	if ( performerBuffs[ksChorus] === ksWarcryFromBeyond &&
		 performerBuffs[ksChorusLevel] > 0 &&
		 performerBuffs[ksNumPerformers] >= 2 )
	{ // Warcry from Beyond
		n_A_CRI += performerBuffs[ksChorusLevel] * performerBuffs[ksNumPerformers];
	}
	if (otherBuffs[ksStriking] >= 1 && n_A_Equip[eq_WEAPON] !== 0) {
		n_A_CRI += otherBuffs[ksStriking];
	}

	if ( miscEffects[ksNoCrit])
	{
		n_A_CRI = 0;
	}

	if ( n_A_WeaponType == weapTyp_KATAR)
	{ // Katar
		n_A_CRI *= 2;
	}

	n_A_CRI = Math.round(n_A_CRI * 10) / 10;

	return n_A_CRI;
}

function calcASPD()
{
	n_A_ASPD = 0;

	// Base ASPD --------------------------------------------------
	jobASPD = ItemAspd[n_A_JOB][n_A_WeaponType + 1]; // BaseASPD

	// DualHand Staff Adjustments ---
	if ( n_A_JOB === cls_ABI || n_A_JOB === cls_ABIt )
	{
		if ( StPlusWeapon( bon_TWO_HANDED_STAFF ) )
		{
			jobASPD += 5;
		}
	}
	if ( n_A_JobSearch2() === cls_MON )
	{
		if ( StPlusWeapon( bon_TWO_HANDED_STAFF ) )
		{
			if ( n_A_JOB === cls_SUR || n_A_JOB === cls_SURt )
			{
				jobASPD += 2;
			}
			else
			{
				jobASPD -= 2;
			}
		}
	}
	if ( n_Nitou )
	{ // Dual Weapon
		var index = Number( n_A_Weapon2Type ) + Number( weapTyp_SHIELD ) + 1;
		jobASPD += ItemAspd[n_A_JOB][index];
	}

	// Stat ASPD --------------------------------------------------
	statASPD = Math.sqrt( ( n_A_AGI * 9.9987 ) + ( n_A_DEX * 0.1922 ) );

	// flat ASPD bonuses --------------------------------------
	var shieldPenalty = 0;
	if ( n_A_Equip[eq_SHIELD] !== 305 )
	{ // 305 = "(No Shield)"
		shieldPenalty += ItemAspd[n_A_JOB][weapTyp_SHIELD + 1];
	}

	// % ASPD Mods ---------------------------------------------
	var aspdMultiplier = 0;
	var ASPDch = 0; // for some mutual exclusive skills

	// Skills
	if ( SkillSearch( skill_GS_GATLING_FEVER ) )
	{ // Gatling Fever
		if ( n_A_WeaponType == weapTyp_GATLING_GUN )
		{
			aspdMultiplier += 2 * SkillSearch( skill_GS_GATLING_FEVER );
		}
	}
	if ( ( SkillSearch( skill_SUR_GENTLE_TOUCH_CHANGE ) || acolyteBuffs[ksPPChange] ) )
	{ // Suras PP Change ASPD increase: [(Target’s AGI x Skill Level) / 60] %
		if ( SkillSearch( skill_SUR_GENTLE_TOUCH_CHANGE ) )
		{
			var aspdMod = ( ( n_A_AGI * SkillSearch( skill_SUR_GENTLE_TOUCH_CHANGE ) ) / 60.0 );
			aspdMultiplier += aspdMod;
		}
		else
		{
			aspdMultiplier += ( ( acolyteBuffs[ksSuraAgility] * acolyteBuffs[ksPPChange] ) / 60.0 );
		}
	}
	if ( performerBuffs[ksWandererSolo] === ksGloomyShynessW && performerBuffs[ksWandererSoloLevel] > 0 )
	{ // Gloomy Shyness
		aspdMultiplier -= 15 + 5 * performerBuffs[ksWandererSoloLevel];
	}
	else if ( performerBuffs[ksMaestroSolo] === ksGloomyShynessM && performerBuffs[ksMaestroSoloLevel] > 0 )
	{ // Gloomy Shyness
		aspdMultiplier -= 15 + 5 * performerBuffs[ksMaestroSoloLevel];
	}
	if ( SkillSearch( skill_LK_FRENZY ) )
	{ // Frenzy
		aspdMultiplier += 30;
	}
	if ( n_A_WeaponType == weapTyp_BOOK && SkillSearch( skill_SA_STUDY ) )
	{ // Study
		aspdMultiplier += Math.floor( ( SkillSearch( skill_SA_STUDY ) ) / 2 );
	}
	if ( miscEffects[ksQuagmire] == 0 && miscEffects[ksAgiDown] == 0 )
	{ // things affected by Quagmire/agi down
		if ( n_A_WeaponType == 3 && SkillSearch( skill_KN_TWOHAND_QUICKEN ) && SkillSearch(skill_LK_FRENZY) == 0 )
		{ // Two Handed Quicken
			aspdMultiplier += 30;
		}
		if ( SkillSearch( skill_BS_ANDRENALINE_RUSH ) )
		{ // Own AR
			if ( weapTyp_AXE <= n_A_WeaponType && n_A_WeaponType<=weapTyp_MACE )
			{
				aspdMultiplier += 30;
			}
		}
		else if ( otherBuffs[ksAdrenalineRush] == 1 )
		{ // PartyAR
			if ( weapTyp_AXE <= n_A_WeaponType && n_A_WeaponType <= weapTyp_MACE )
			{
				aspdMultiplier += 25;
			}
		}
		else if ( otherBuffs[ksAdrenalineRush] == 2 )
		{ // PartyFAR
			if ( n_A_WeaponType != weapTyp_BOW && !(weapTyp_HANDGUN <= n_A_WeaponType && n_A_WeaponType <= weapTyp_GRENADE) )
			{
				aspdMultiplier += 25;
			}
		}
		else if ( otherBuffs[ksAdrenalineRush] == 3 )
		{ // AR Scroll
			if ( weapTyp_AXE <= n_A_WeaponType && n_A_WeaponType<=weapTyp_MACE )
			{
				aspdMultiplier += 30;
			}
		}

		if ( n_A_WeaponType == weapTyp_SWORD && SkillSearch( skill_KN_ONE_HAND_QUICKEN ) )
		{ // One Handed Quicken
			aspdMultiplier += 30;
			ASPDch = 1;
		}
		if ( ASPDch === 0 && ( TimeItemNumSearch( temp_ALCHESET ) || TimeItemNumSearch( temp_NOBLE ) ) )
		{ // ???
			aspdMultiplier += 30;
			ASPDch = 1;
		}
		if ( ( n_A_WeaponType == weapTyp_SPEAR || n_A_WeaponType == weapTyp_2HSPEAR ) && SkillSearch( skill_CR_SPEAR_QUICKEN ) )
		{ // Spear Quicken
			aspdMultiplier += 30;
			ASPDch = 1;
		}
	}
	if ( SkillSearch( skill_TKM_SOLAR_LUNAR_AND_STELLAR_SHADOW ) && n_A_JobLV >= 50 )
	{ // Shadow
		ASPDch = 1;
		aspdMultiplier += 3 * SkillSearch( skill_TKM_SOLAR_LUNAR_AND_STELLAR_SHADOW );
	}
	if ( SkillSearch( skill_GS_LAST_STAND ) )
	{ // Last Stand
		aspdMultiplier += 20;
	}
	if ( SkillSearch( skill_GS_SINGLE_ACTION ) )
	{ // Single Action
		aspdMultiplier += Math.floor( ( SkillSearch( skill_GS_SINGLE_ACTION ) + 1 ) / 2 );
	}
	if ( performerBuffs[ksBardSolo] === ksImpressiveRiff &&
	     performerBuffs[ksBardSoloLevel] > 0 &&
	     ASPDch === 0 )
	{ // Impressive Riff
		if ( n_A_WeaponType != weapTyp_BOW &&
		     !( weapTyp_HANDGUN <= n_A_WeaponType && n_A_WeaponType <= weapTyp_GRENADE_LAUNCHER ) )
		{
			var skillBonus = performerBuffs[ksBardSoloLevel];
			var musicLessonsBonus = performerBuffs[ksMusicLessons];
			var agiBonus = Math.floor( performerBuffs[ksBardAgi] / 10 );
			aspdMultiplier += skillBonus + musicLessonsBonus + agiBonus;
		}
	}
	if ( n_A_JobSearch2() === cls_CRU && SkillSearch( skill_KN_CAVALIER_MASTERY ) )
	{ // Cavalier Mastery
		aspdMultiplier -= ( 5 - SkillSearch( skill_KN_CAVALIER_MASTERY ) ) * 10;
	}
	if ( n_A_JobSearch2() === cls_KNI &&
		 ( SkillSearch( skill_KN_CAVALIER_MASTERY ) || SkillSearch( skill_RUN_DRAGON_TRAINING ) ) )
	{ // Cavalier or Dragon Mastery
		if ( SkillSearch( skill_KN_CAVALIER_MASTERY ) )
		{
			aspdMultiplier -= ( 5 - SkillSearch( skill_KN_CAVALIER_MASTERY ) ) * 10;
		}
		else
		{
			aspdMultiplier -= ( 5 - SkillSearch( skill_RUN_DRAGON_TRAINING ) ) * 5;
		}
	}
	if ( SkillSearch( skill_MO_MENTAL_STRENGTH ) )
	{ // Mental Strength
		aspdMultiplier -= 25;
	}
	if ( SkillSearch( skill_CR_DEFENDING_AURA ) )
	{ // Defending Aura
		aspdMultiplier -= ( 25 - SkillSearch( skill_CR_DEFENDING_AURA ) * 5 );
	}
	if ( performerBuffs[ksWandererSolo] === ksSwingDance && performerBuffs[ksWandererSoloLevel] > 0 )
	{ // Swing Dance
		var skillBonus = performerBuffs[ksWandererSoloLevel] * 5;
		var voiceLessonsBonus = performerBuffs[ksWandererVoiceLessons];

		aspdMultiplier += skillBonus + voiceLessonsBonus;
	}
	if ( performerBuffs[ksChorus] === ksDancesWithWargs &&
		 performerBuffs[ksChorusLevel] > 0 &&
		 performerBuffs[ksNumPerformers] >= 2 )
	{ // Dances with Wargs
		var skillBonus = 5;
		var performerBonus = performerBuffs[ksNumPerformers] * 5;

		if ( performerBonus > 25 )
		{
			performerBonus = 25;
		}

		aspdMultiplier += skillBonus + performerBonus;
	}

	// Items
	if ( usableItems[ksAttackSpeed] || usableItems[ksGuaranaCandy] )
	{ // non-stackable speed pots
		var _mul = 0;
		if ( usableItems[ksAttackSpeed] === spdpot_CONC || usableItems[ksGuaranaCandy] )
		{ // Concentration Postion and Guarana Candy (per Lord Novice)
			_mul = 10;
		}
		if ( usableItems[ksAttackSpeed] === spdpot_AWAK )
		{ // Awakening Potion
			_mul = 15;
		}
		if ( usableItems[ksAttackSpeed] === spdpot_BERSERK )
		{ // Berserk Potion
			_mul = 20;
		}
		aspdMultiplier += _mul;
	}

	aspdMultiplier = ( 100 - aspdMultiplier ) / 100.0

	// Correction ---------------------------------------------
	var aspdCorrection = 0;
	if ( n_A_AGI < 205 )
	{
		aspdCorrection = ( Math.sqrt( 205 ) - Math.sqrt( n_A_AGI ) ) / 7.15;
	}

	// Penalty ------------------------------------------------
	var aspdPenalty = 0.96;
	if ( jobASPD > 145 )
	{
		aspdPenalty = 1 - ( jobASPD - 144 ) / 50;
	}

	// Calculate ASPD -----------------------------------------
	n_A_ASPD = ( 200 - ( 200 - ( jobASPD + shieldPenalty - aspdCorrection + statASPD * aspdPenalty ) ) * aspdMultiplier );

	// Equipment ASPD -----------------------------------------
	var equipASPD = n_tok[bon_ASPD_MUL];
	if ( EquipNumSearch( 654 ) )
	{ // Western Outlaw
		equipASPD += Math.floor( n_A_AGI / 14 );
	}
	if ( n_A_Equip[eq_WEAPON] === 484 && SU_STR >= 50 )
	{ // Sage's Diary
		equipASPD += 5;
	}
	if ( EquipNumSearch( 624 ) )
	{ // Hurricane Fury
		equipASPD += n_A_Weapon_ATKplus;
	}
	if ( EquipNumSearch( 641 ) )
	{ // Book of the Dead
		equipASPD += n_A_Weapon_ATKplus;
	}
	if ( SU_STR >= 77 && EquipNumSearch( 944 ) )
	{ // Lunar Skillet
		equipASPD += 4;
	}
	if ( n_A_JobSearch2() === cls_KNI && rebirthClass && EquipNumSearch( 855 ) )
	{ // Tournament Shield System Set
		equipASPD -= 5;
	}
	if ( EquipNumSearch( 1086 ) || EquipNumSearch( 1088 ) )
	{ // Glorious Morning Star/Cleaver
		if ( n_A_Weapon_ATKplus >= 6 )
		{
			equipASPD += 5;
		}
		if ( n_A_Weapon_ATKplus >= 9 )
		{
			equipASPD += 5;
		}
	}
	if ( EquipNumSearch( 1081 ) )
	{ // Glorious Spear
		if ( n_A_Weapon_ATKplus >= 6 )
		{
			equipASPD += 10;
		}
	}
	if ( EquipNumSearch( 1077 ) )
	{ // Glorious Flamberge
		if ( n_A_Weapon_ATKplus >= 7 )
		{
			equipASPD += 5;
		}
		if ( n_A_Weapon_ATKplus >= 9 )
		{
			equipASPD += 5;
		}
	}
	if ( SU_STR >= 95 && EquipNumSearch( 621 ) )
	{ // DoomSlayer
		equipASPD -= 40;
	}
	if ( EquipNumSearch( 903 ) && n_A_JobSearch2() === cls_CRU )
	{ // Assaulter Spear
		equipASPD += 20;
	}
	if ( SU_STR >= 95 && EquipNumSearch( 1167 ) )
	{ // Giant Axe
		equipASPD += 3;
	}
	if ( EquipNumSearch( 1121 ) && n_A_JobSearch() === cls_THI )
	{ // Thief Figurine
		equipASPD += 3;
	}
	if ( EquipNumSearch( 1299 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Mercury Riser
		equipASPD += 2;
		if ( n_A_HEAD_DEF_PLUS >= 9 )
		{
			equipASPD += 2;
		}
	}
	if ( EquipNumSearch( 1341 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Leo Diadem
		equipASPD += 3;
	}
	if ( EquipNumSearch( 1354 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Sagittarius Crown
		equipASPD += 2;
	}
	if ( EquipNumSearch( 1355 ) && n_A_HEAD_DEF_PLUS >= 8 )
	{ // Scorpio Crown
		equipASPD += 2;
		if ( EquipNumSearch( 1355 ) && n_A_HEAD_DEF_PLUS >= 10 )
		{ // Scorpio Crown
			equipASPD += 2;
		}
	}
	if ( EquipNumSearch( 1004 ) || EquipNumSearch( 1006 ) )
	{ // Rogue's Treasure + Cold Heart/Black Cat
		equipASPD += Math.floor( n_A_Weapon_ATKplus / 2 );
	}
	if ( usableItems[ksCelermineJuice] )
	{ // Celermine Juice
		equipASPD += 10;
	}
	if ( EquipNumSearch( 1464 ) )
	{ //Heroic Backpack
		if (n_A_SHOULDER_DEF_PLUS >= 7 && SU_AGI >= 90) { equipASPD += 8; }
	}
	if ( EquipNumSearch( 1515 ) )
	{ //Pegasus Ear Wing
		if (n_A_BaseLV >= 100) { equipASPD += 1; }
		if (n_A_BaseLV >= 150) { equipASPD += 1; }
	}


	equipASPD = equipASPD / 100.0
	percentAspdEquipment = (195 - n_A_ASPD) * equipASPD;
	n_A_ASPD += percentAspdEquipment;

	// flat ASPD bonuses --------------------------------------
	var flatASPD = n_tok[bon_ASPD_ADD];
	if ( n_A_Equip[eq_WEAPON] === 47 )
	{ // Masamune
		flatASPD += 2;
	}
	if ( SU_AGI >= 120 && EquipNumSearch( 1255 ) )
	{ // Sniper Googles
		flatASPD += 1;
	}
	if ( SU_AGI >= 120 && EquipNumSearch( 1399 ) )
	{ // Giant Crossbow
		flatASPD += 1;
	}
	if ( SU_STR >= 120 && EquipNumSearch( 1259 ) )
	{ // Midas Whispers
		flatASPD += 1;
	}
	if ( EquipNumSearch( 1284 ) )
	{ // alca bringer
		flatASPD += Math.floor( n_A_Weapon_ATKplus / 2 );
	}
	if ( n_A_WeaponType==weapTyp_2HSWORD && CardNumSearch( 509 ) )
	{ // Fanat
		if ( n_A_Weapon_ATKplus >= 10 ) flatASPD += 1;
		if ( n_A_Weapon_ATKplus >= 14 ) flatASPD += 1;
	}
	if ( n_A_WeaponType==weapTyp_BOW && CardNumSearch( 504 ) )
	{ // Beholder Master
		if ( n_A_Weapon_ATKplus >= 10 ) flatASPD += 1;
		if ( n_A_Weapon_ATKplus >= 14 ) flatASPD += 1;
	}
	if ( EquipNumSearch( 1464 ) )
	{ //Heroic Backpack
		if (n_A_SHOULDER_DEF_PLUS >= 9 && SU_AGI >= 90) { flatASPD += 1; }
	}
	if ( SkillSearch( skill_RUN_FIGHTING_SPIRIT ) )
	{ // Asir Rune
		flatASPD += SkillSearch( skill_RUN_RUNE_MASTERY ) / 10.0 * 4;
	}
	if ( SkillSearch(skill_SOR_SUMMON_TYPE) == 1 && SkillSearch(skill_SOR_SUMMON_LEVEL) > 0 && SkillSearch(skill_SOR_SPIRIT_CONTROL) == 1 ) {
		flatASPD += 5;
	}

	n_A_ASPD += flatASPD;

	// Cap to limits ------------------------------------------
	if ( thirdClass === 1 )
	{ // 3rd class
		n_A_ASPD = Min( n_A_ASPD, 193 );
	}
	else
	{ // non-3rd class
		n_A_ASPD = Min( n_A_ASPD, 190 );
	}

	return n_A_ASPD.toFixed(2);
}

function CalcVariableCast()
{
	// reset variable cast
	variableCastTime = ( 1 - Math.sqrt( ( n_A_DEX * 2 + n_A_INT ) / 530 ) );
	variableCastTime = Max( variableCastTime, 0 );


	var w=100;
	w += n_tok[bon_RED_CAST];

	if ( n_A_JobSearch() == cls_MAG && CardNumSearch( 454 ) )
	{ // MageSet ?
		w -= 15;
	}
	if ( n_A_JobSearch2() == cls_SAG && CardNumSearch( 460 ) )
	{ // SageSet ?
		w -= 15;
	}
	if ( EquipNumSearch( 750 ) )
	{ // Set ?
		w -= n_A_Weapon_ATKplus;
	}
	if ( n_A_card[8] == 177 )
	{ // Katheryne
		w -= n_A_HEAD_DEF_PLUS;
	}
	/*if ( EquipNumSearch( 849 ) )
	{ // Balloon Hat
		w -= n_A_HEAD_DEF_PLUS;
	}*/
	if ( n_A_Weapon_ATKplus >= 9 &&EquipNumSearch(1084))
	{ // Glorious Arc Wand
		w -= 5;
	}
	if ( n_A_Weapon_ATKplus >= 9 &&EquipNumSearch(1095))
	{ // Glorious Apocalypse
		w -= 5;
	}
	if(SU_DEX >= 120 && EquipNumSearch(1260))
	{ // Magic Stone Hat
		w -= 2;
	}
	if ( EquipNumSearch( 1145 ) )
	{ // Mini Propeller (Kafra)
		w -= n_A_HEAD_DEF_PLUS;
	}
	if ( EquipNumSearch( 750 ) )
	{ // Spiritual Ring/Soul Staff/Wizardry Staff
		w -= n_A_Weapon_ATKplus;
	}
	if ( EquipNumSearch( 872 ) )
	{ // Crown of Deceit
		if ( n_A_HEAD_DEF_PLUS >= 7 )
		{
			w -= 5;
		}
		if ( n_A_HEAD_DEF_PLUS >= 9 )
		{
			w -= 5;
		}
	}
	if ( EquipNumSearch( 1149 ) )
	{ // Skull Cap
		if ( EquipNumSearch( 89 ) || EquipNumSearch( 936 ) )
		{ // Evil Bone Wand or Thorn Staff of Darkness
			if ( n_A_Weapon_ATKplus >= 10 )
			{
				w -= 10;
			}
		}
	}
	if ( EquipNumSearch( 1339 ) && n_A_HEAD_DEF_PLUS >= 8 )
	{ // Capricorn Diadem
		w -= 3;
	}
	if ( EquipNumSearch( 1344 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Sagittarius Diadem
		w -= 3;
		if ( n_A_HEAD_DEF_PLUS >= 9 )
		{
			w -= 2;
		}
	}
	if ( EquipNumSearch( 1006 ) )
	{ // Rogue's Treasure + Black Cat
		w -= Math.floor( n_A_Weapon_ATKplus / 2 );
	}

	// Skills
	if ( performerBuffs[ksBardSolo] === ksMagicStrings && performerBuffs[ksBardSoloLevel] > 0 )
	{ // Magic Strings
		var skillBonus = performerBuffs[ksBardSoloLevel] * 3;
		var musicLessonsBonus = performerBuffs[ksMusicLessons];
		var dexBonus = Math.floor( performerBuffs[ksBardDex] / 10 );
		w -= skillBonus + musicLessonsBonus + dexBonus;
	}
	if ( SkillSearch(skill_KAG_16TH_NIGHT) ) {
		w -= 50;
	}

	if ( TimeItemNumSearch( temp_ISILLA ) )
	{ // Isilla
		w -= 50;
	}

	if ( w < 0 )
	{
		w=0;
	}

	variableCastTime *= w /100;

	w = 100;

	if(StPlusCalc2(bon_CAST_SKILL+ n_A_ActiveSkill) != 0)
		w -= StPlusCalc2(bon_CAST_SKILL+ n_A_ActiveSkill);
	if(StPlusCard(bon_CAST_SKILL+ n_A_ActiveSkill) != 0)
		w -= StPlusCard(bon_CAST_SKILL+ n_A_ActiveSkill);
	if ( n_A_ActiveSkill==321 || n_A_ActiveSkill==197)
	{ // Guillotine Fist
		if ( SkillSearch(195) && n_A_Weapon_ATKplus >= 9 && EquipNumSearch(1097))
		{ // Glorious Fist
			w -= 100;
		}
	}
	if ( n_A_ActiveSkill === 430 )
	{ // Tracking
		if ( n_A_Weapon_ATKplus >= 9 && EquipNumSearch( 1100 ) )
		{ // Glorious Rifle
			w += 25;
		}
	}
	if ( n_A_ActiveSkill === 131 )
	{
		if ( n_A_Weapon_ATKplus >= 10 && EquipNumSearch( 1169 ) )
		{ // Lacrima Stick
			w -= 8;
		}
	}
	if ( w < 0 )
	{
		w = 0;
	}

	variableCastTime *= w /100;

	if ( acolyteBuffs[ksSuffragium] )
	{
		variableCastTime *= ( 100 - 15 * acolyteBuffs[ksSuffragium] ) / 100;
	}
	if ( SkillSearch( skill_PR_MEMORIZE ) )
	{
		variableCastTime = variableCastTime / 2;
	}

	if ( SkillSearch( skill_WAR_READING_SPELLBOOK ) )
	{
		// instant list
		var w2 = [51,54,56,57,125,126,127,128,131,132,133,534,540,542,545,547,553];
		if ( NumSearch( n_A_ActiveSkill, w2 ) )
		{
			variableCastTime = 0;
		}
	}

	if (SkillSearch(skill_WAR_INTENSE_TELEKINESIS)) {
	    variableCastTime -= (10 * SkillSearch(skill_WAR_INTENSE_TELEKINESIS)) / 100;
;	}

	return variableCastTime;
}

function CalcFixedCast()
{
	fixedCastTime = 1;
	var reductionPercentage = 0;

	reductionPercentage += n_tok[bon_RED_FIXEDCAST];

	// Equipment

	// Items

	// Skills
	if ( SkillSearch( skill_WAR_RADIUS ) )
	{ // Radius
		if ( n_A_ActiveSkill >= skill_WAR_READING_SPELLBOOK && n_A_ActiveSkill <= skill_WAR_TETRA_VORTEX )
		{ // reduce fixed cast time of warlock skills
			reductionPercentage += Math.floor(n_A_INT/15) + Math.floor(n_A_BaseLV/15) + 5 * SkillSearch( skill_WAR_RADIUS );
		}
	}

	if ( acolyteBuffs[ksSacrament] )
	{ // Sacrament
		reductionPercentage += acolyteBuffs[ksSacrament] * 10;
	}

	if ( performerBuffs[ksChorus] === ksDancesWithWargs &&
		 performerBuffs[ksChorusLevel] > 0 &&
		 performerBuffs[ksNumPerformers] >= 2 )
	{ // Dances with Wargs
		var performerBonus = performerBuffs[ksNumPerformers] * 10;

		if ( performerBonus > 70 )
		{
			performerBonus = 70;
		}

		reductionPercentage += performerBonus;
	}

	// Fixed Cast is capped at 50% reduction
	if ( reductionPercentage > 50 )
	{
		reductionPercentage = 50;
	}

	// Calculate final Fixed Cast Percentage
	fixedCastTime *= ( 1 - reductionPercentage / 100 );
	if ( SkillSearch(skill_KAG_16TH_NIGHT) ) {
		fixedCastTime = 0;
	}

	// Reading Spellbook gets instant cast
	if ( SkillSearch( skill_WAR_READING_SPELLBOOK ) )
	{
		// instant list
		var spellbookSpells = [51,54,56,57,125,126,127,128,131,132,133,534,540,542,545,547,553];
		if ( NumSearch( n_A_ActiveSkill, spellbookSpells ) )
		{
			fixedCastTime = 0;
		}
	}

	return fixedCastTime;
}

function CalcDelay()
{
	globalCastDelay = 0;

	// Equipment
	if ( n_A_Weapon_ATKplus >= 9 && EquipNumSearch( 934 ) )
	{ // Tae Goo Lyeon
		n_tok[bon_RED_CASTDELAY] += 20;
	}
	if ( EquipNumSearch( 1036 ) && n_A_HEAD_DEF_PLUS >= 6 )
	{ // Parade Hat
		n_tok[bon_RED_CASTDELAY] += n_A_HEAD_DEF_PLUS - 5;
	}
	if(n_A_Weapon_ATKplus >= 9 &&EquipNumSearch(1084)) // Glorius ArcWand
		n_tok[bon_RED_CASTDELAY] += 5;
	if(n_A_Weapon_ATKplus >= 9 &&EquipNumSearch(1095)) // Glorius Apocalypse
		n_tok[bon_RED_CASTDELAY] += 5;
	if ( EquipNumSearch(936) )
	{ // Thorn Staff of Darkness
		n_tok[bon_RED_CASTDELAY] += 3 * Math.floor( n_A_Weapon_ATKplus / 2 );
	}
	if ( EquipNumSearch( 872 ) )
	{ // Crown of Deceit
		if ( n_A_HEAD_DEF_PLUS >= 9 )
		{
			n_tok[bon_RED_CASTDELAY] += 5;
		}
	}
	if ( EquipNumSearch( 1459 ) ) {
		n_tok[bon_RED_CASTDELAY] += n_A_SHIELD_DEF_PLUS*2;
	}

	// Skills
	if ( performerBuffs[ksBardSolo] === ksMagicStrings && performerBuffs[ksBardSoloLevel] > 0 )
	{ // Magic Strings
		var skillBonus = performerBuffs[ksBardSoloLevel] * 3;
		var musicLessonsBonus = performerBuffs[ksMusicLessons] * 2;
		var intBonus = Math.floor( performerBuffs[ksBardInt] / 5 );

		n_tok[bon_RED_CASTDELAY] += skillBonus + musicLessonsBonus + intBonus;
	}

	n_tok[bon_RED_CASTDELAY] = Min( n_tok[bon_RED_CASTDELAY], 100 );
	globalCastDelay = n_tok[bon_RED_CASTDELAY];
}

function calcReUse()
{
	// todo
	return 1;
}

function calcHPReg( n_A_HPR )
{
	n_A_HPR = Math.floor( n_A_VIT / 5 ) + Math.floor( n_A_MaxHP / 200 );
	if ( n_A_HPR < 1 )
	{
		n_A_HPR = 1;
	}

	multiplier = 100;
	multiplier += n_tok[bon_HP_REG];

	// cards
	if ( SU_LUK >= 77)
	{ // ArcAngel
		multiplier += 100 * CardNumSearch(221);
	}
	if ( n_A_JobSearch()==cls_TKK && EquipNumSearch(672))
	{ // MagistreHat
		multiplier += 3;
	}
	if ( n_A_SHOES_DEF_PLUS <= 4 && CardNumSearch(407))
	{ // GoldAcidus
		multiplier += 5;
	}

	// Items
	if ( usableItems[ksBoucheDeNoel] )
	{ // Bouche De Noel
		multiplier += 3;
	}
	if ( usableItems[ksIncreaseSP] > 0 )
	{ // Increase SP Potion
		var modifier = 3;

		if ( usableItems[ksIncreaseSP] === 1 )
		{
			modifier = 2;
		}
		else if ( usableItems[ksIncreaseSP] === 3 )
		{
			modifier = 5;
		}
		multiplier += modifier;
	}

	// Skills
	if ( SkillSearch( skill_SUR_GENTLE_TOUCH_REVITALIZE ) || acolyteBuffs[ksPPRevitalize] > 0 )
	{
		// Natural HP recovery increase: [(Skill Level x 30) + 50] %
		if ( SkillSearch( skill_SUR_GENTLE_TOUCH_REVITALIZE ) )
		{
			multiplier += ( ( SkillSearch( skill_SUR_GENTLE_TOUCH_REVITALIZE ) * 30 ) + 50 ) - 100;
		}
		else
		{
			multiplier += ( ( acolyteBuffs[ksPPRevitalize] * 30 ) + 50 ) - 100;
		}
	}

	// apply to regen
	n_A_HPR = Math.floor( n_A_HPR * multiplier / 100 );

	if ( miscEffects[ksPoisoned] )
	{ // poison drops it to zero
		n_A_HPR = 0;
	}

	return n_A_HPR;
}

function calcSPReg(n_A_SPR)
{
	n_A_SPR = Math.floor(n_A_INT /6) + Math.floor(n_A_MaxSP /100) +1;

	w=100;
	w += SkillSearch(skill_HP_MEDIATIO) *3;

	w += n_tok[bon_SP_REG];

	// Skills
	if ( SkillSearch( skill_RUN_VITALITY_ACTIVATION ) )
	{ // Isia Rune
		w-=100;
	}
	if ( SkillSearch( skill_HP_MEDIATIO ) )
	{ // Meditatio
		w += 3 * SkillSearch( skill_HP_MEDIATIO );
	}

	// Equipment
	if(SU_LUK >= 77)
		w += 100 * CardNumSearch(221); // ArcAngel

	if(n_A_JobSearch()==cls_TKK && EquipNumSearch(673)) // Ayam
		w += 3;
	if(n_A_HEAD_DEF_PLUS <= 4 && n_A_card[card_loc_HEAD_UPPER]==179) // BlueAcidus
		w += 5;
	if(n_A_card[card_loc_HEAD_MIDDLE]==179) // BlueAcidus
		w += 5;
	if(n_A_SHOES_DEF_PLUS <= 4 && CardNumSearch(407)) // GoldAcidus
		w += 5;
	if(EquipNumSearch(1119) && n_A_JobSearch()==cls_MAG) // MageFigure
		w += 5;

	// Items
	if ( usableItems[ksBoucheDeNoel] )
	{ // Bouche De Noel
		w += 3;
	}
	if ( usableItems[ksIncreaseSP] > 0 )
	{ // Increase SP Potion
		var modifier = 4;

		if ( usableItems[ksIncreaseSP] === 1 )
		{
			modifier = 2;
		}
		else if ( usableItems[ksIncreaseSP] === 3 )
		{
			modifier = 8;
		}
		w += modifier;
	}

	n_A_SPR = Math.floor(n_A_SPR * w /100);

	if(n_A_INT>=120)
		n_A_SPR += Math.floor((n_A_INT-120)/2) +4;

	if(miscEffects[ksPoisoned])
		n_A_SPR = 0;

	return n_A_SPR;

}

function getWeaponElement()
{
	n_A_Weapon_element= parseInt(formElements["A_Weapon_element"].value)
	n_A_Weapon2_element = n_A_Weapon_element; // Left hand

	if ( n_A_Weapon_element == ele_NEUTRAL )
	{ // no endow
		for ( var j=0;ItemOBJ[n_A_Equip[eq_WEAPON]][j +itm_BONUS_START] != bon_NONE;j += 2)
		{ // Right Hand
			if(bon_ELEMENT == ItemOBJ[n_A_Equip[eq_WEAPON]][j +itm_BONUS_START])
			{
				n_A_Weapon_element = ItemOBJ[n_A_Equip[eq_WEAPON]][j +itm_BONUS_START+1];
			}
		}
		for ( var j=0;ItemOBJ[n_A_Equip[eq_WEAPONII]][j +itm_BONUS_START] != bon_NONE;j += 2)
		{ // LeftHand
			if ( bon_ELEMENT == ItemOBJ[n_A_Equip[eq_WEAPONII]][j + itm_BONUS_START] )
			{
				n_A_Weapon2_element = ItemOBJ[n_A_Equip[eq_WEAPONII]][j + itm_BONUS_START + 1];
			}
		}
		// pseudo cards (ele stones)
		if ( 201 <= cardOBJ[n_A_card[card_loc_WEAPON_I]][card_att_ID] &&
			 cardOBJ[n_A_card[card_loc_WEAPON_I]][card_att_ID] <= 204 )
		{
			n_A_Weapon_element = cardOBJ[n_A_card[card_loc_WEAPON_I]][card_att_ID] -200;
		}
		if ( 201 <= cardOBJ[n_A_card[card_loc_WEAPONII_I]][card_att_ID] &&
			 cardOBJ[n_A_card[card_loc_WEAPONII_I]][card_att_ID] <= 204 )
		{
			n_A_Weapon2_element = cardOBJ[n_A_card[card_loc_WEAPONII_I]][card_att_ID] -200;
		}
		if ( n_A_WeaponType==weapTyp_BOW ||
			 ( weapTyp_HANDGUN <= n_A_WeaponType && n_A_WeaponType <= weapTyp_GRENADE_LAUNCHER ) )
		{ // bows and guns
			n_A_Weapon_element = ArrowOBJ[n_A_Arrow][arr_att_ELEMENT];
		}
		if ( n_A_ActiveSkill === skill_GEN_CART_CANNON )
		{
			n_A_Weapon_element = CannonBallOBJ[n_A_Arrow][arr_att_ELEMENT];
		}
	}
	if ( SkillSearch( skill_SHA_INVISIBILITY ) )
	{
		n_A_Weapon_element = ele_GHOST;
	}
	if ( SkillSearch( skill_KAG_SUMMON_ELEMENTAL_SEAL ) == 10 && SkillSearch( skill_KAG_GET_ELEMENTAL_SEAL ) )
	{
		n_A_Weapon_element = ele_NEUTRAL + SkillSearch( skill_KAG_GET_ELEMENTAL_SEAL );
	}

	BK_Weapon_element = n_A_Weapon_element;
}

function getArmorElement(n_A_BodyZokusei){

	n_A_BodyZokusei = StPlusCard(bon_USR_ELEMENT);
	if(n_A_BodyZokusei==ele_NEUTRAL)
		n_A_BodyZokusei = StPlusCalc2(bon_USR_ELE);
	if ( SkillSearch(skill_MEC_SHAPE_SHIFT ) )
	{
		var skillLevel = SkillSearch( skill_MEC_SHAPE_SHIFT );
		if ( skillLevel === 1 )
		{
			n_A_BodyZokusei = ele_FIRE;
		}
		else if ( skillLevel === 2 )
		{
			n_A_BodyZokusei = ele_EARTH;
		}
		else if ( skillLevel === 3 )
		{
			n_A_BodyZokusei = ele_WIND;
		}
		else if ( skillLevel === 4 )
		{
			n_A_BodyZokusei = ele_WATER;
		}
	}
	if(n_A_JobSearch2() === cls_CRU && CardNumSearch(456)) // CrusaderSet
		n_A_BodyZokusei = ele_HOLY;
	if(otherBuffs[ksBSS])
		n_A_BodyZokusei = ele_HOLY;
	if(usableItems[ksHolyElemental])
		n_A_BodyZokusei = ele_HOLY;

	return n_A_BodyZokusei;
}

function calcRaceElementalReduction()
{
	// Card modifiers
	if ( CardNumSearch( 452 ) && n_A_JobSearch() === cls_ACO )
	{ // Enchanted Peach Tree Card and Acolyte
		n_tok[bon_RED_RC_UNDEAD] += 30;
		n_tok[bon_RED_RC_DEMON] += 30;
	}
	if ( n_A_SHOULDER_DEF_PLUS >= 9 && CardNumSearch( 403 ) )
	{ // Orc Baby Card
		n_tok[bon_RED_ELE_NEUTRAL] += 5;
	}

	// Equipment modifiers
	for ( var i = 971; i <= 977; i++ )
	{ // BG Sets
		if ( EquipNumSearch( i ) )
		{
			n_tok[bon_RED_RC_FORMLESS] -= 200;
			n_tok[bon_RED_RC_UNDEAD] -= 200;
			n_tok[bon_RED_RC_BRUTE] -= 200;
			n_tok[bon_RED_RC_PLANT] -= 200;
			n_tok[bon_RED_RC_INSECT] -= 200;
			n_tok[bon_RED_RC_FISH] -= 200;
			n_tok[bon_RED_RC_DEMON] -= 200;
			n_tok[bon_RED_RC_ANGEL] -= 200;
			n_tok[bon_RED_RC_DRAGON] -= 200;
		}
	}
	if ( EquipNumSearch( 737 ) )
	{ // Survivor's Mant + Survivor's Rod
		n_tok[bon_RED_ELE_NEUTRAL] += n_A_SHOULDER_DEF_PLUS * 3;
	}
	if ( EquipNumSearch( 957 ) )
	{ // Asprika
		for ( var i = 0; i <= ele_UNDEAD; i++ )
		{
			n_tok[bon_RED_ELE_NEUTRAL + i] += 30;
		}
	}
	if ( EquipNumSearch( 1295 ) && n_A_LEFT_DEF_PLUS >= 5 )
	{ // Immune Shield
		for ( var i = 5; i <= 12; i++ )
		{ // bonus is applied for levels 5-12
			if ( i <= n_A_LEFT_DEF_PLUS )
			{
				n_tok[bon_RED_ELE_NEUTRAL] += 1;
			}
		}
	}
	if ( EquipNumSearch( 1335 ) && n_A_HEAD_DEF_PLUS >= 5 )
	{ // Cat Ear Beret
		for ( var i = 5; i <= 12; i++ )
		{ // bonus is applied for levels 5-12
			if ( i <= n_A_HEAD_DEF_PLUS )
			{
				n_tok[bon_RED_RC_DEMI_HUMAN] += 2;
			}
		}
	}
	if ( EquipNumSearch( 1340 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Gemini Diadem
		n_tok[bon_RED_ELE_WIND] += 5;
	}
	if ( EquipNumSearch( 1356 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Taurus Crown
		n_tok[bon_RED_ELE_FIRE] += 7;
	}
	if ( EquipNumSearch( 1365 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Gemini Crown
		n_tok[bon_RED_ELE_WIND] += 5;
	}
	if ( EquipNumSearch( 1367 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Virgo Crown
		n_tok[bon_RED_ELE_EARTH] += 5;
	}
		if ( EquipNumSearch( 1464 ) )
	{ //Heroic Backpack
		if (n_A_SHOULDER_DEF_PLUS >= 7 && SU_VIT >= 90) { n_tok[bon_RED_ELE_NEUTRAL] += 5; }
		if (n_A_SHOULDER_DEF_PLUS >= 9 && SU_VIT >= 90) { n_tok[bon_RED_ELE_NEUTRAL] += 5; }
	}

	// Skill modifiers
	if ( otherBuffs[ksResistantSouls] && n_A_JobSearch2() != cls_CRU )
	{ // Resistant Souls given to other classes other than crusader
		n_tok[bon_RED_RC_DEMON] += otherBuffs[ksResistantSouls] * 5;
	}
	if ( SkillSearch( skill_SA_DRAGONOLOGY ) )
	{ // Dragonology
		n_tok[bon_RED_RC_DRAGON] += SkillSearch( skill_SA_DRAGONOLOGY ) * 4;
	}
	if(SkillSearch(150))
	{
		n_tok[bon_RED_ELE_NEUTRAL] += SkillSearch(150);
		n_tok[bon_RED_ELE_FIRE] += 4 * SkillSearch(150);
	}
	if(SkillSearch(156))
	{
		n_tok[bon_RED_ELE_HOLY] += 5 * SkillSearch(156);
	}
	if(otherBuffs[ksResistantSouls] && n_A_JobSearch2() != cls_CRU)
	{
		n_tok[bon_RED_ELE_HOLY] += 5 * otherBuffs[ksResistantSouls];
	}
	if ( performerBuffs[ksEnsemble] === ksAcousticRhythm && performerBuffs[ksEnsembleLevel] > 0 )
	{ // Acoustic Rhythm
		for ( i = bon_RED_ELE_WATER; i <= bon_RED_ELE_UNDEAD; i++ )
		{
			n_tok[i] += 55 + 5 * performerBuffs[ksEnsembleLevel];
		}
		for ( i = bon_RES_STATUS_POISON; i <= bon_RES_STATUS_STONE; i++ )
		{
			n_tok[i] += 10 * performerBuffs[ksEnsembleLevel];
		}
	}

	// Item Modifiers
	if ( usableItems[ksColdproof] )
	{
		n_tok[bon_RED_ELE_WATER] += 20;
		n_tok[bon_RED_ELE_WIND] -= 15;
	}
	if ( usableItems[ksEarthproof] )
	{
		n_tok[bon_RED_ELE_EARTH] += 20;
		n_tok[bon_RED_ELE_FIRE] -= 15;
	}
	if ( usableItems[ksFireproof] )
	{
		n_tok[bon_RED_ELE_FIRE] += 20;
		n_tok[bon_RED_ELE_WATER] -= 15;
	}
	if ( usableItems[ksThunderproof] )
	{
		n_tok[bon_RED_ELE_WIND] += 20;
		n_tok[bon_RED_ELE_EARTH] -= 15;
	}
	if( usableItems[ksUndeadElemental] )
	{
		n_tok[bon_RED_ELE_WATER] += 20;
		n_tok[bon_RED_ELE_FIRE] += 20;
		n_tok[bon_RED_ELE_WIND] += 20;
		n_tok[bon_RED_ELE_EARTH] += 20;
	}
// ---------------------------------------------
	if(EquipNumSearch(624)) // Hurricane Fury
		n_tok[bon_RED_SIZ_MEDIUM] += n_A_Weapon_ATKplus;
	if(EquipNumSearch(1389) && n_A_SHIELD_DEF_PLUS >= 9) // Giant Shield
		n_tok[bon_RED_SIZ_LARGE] += 5;

	if(SkillSearch(421))
		n_tok[bon_RED_RANGE] += 20;

	if(EquipNumSearch(1030))
	{
		n_tok[bon_RED_BOSS] -= (5 * EquipNumSearch(1030));
		n_tok[bon_RED_NONBOSS] -= (5 * EquipNumSearch(1030));
	}
	if(EquipNumSearch(1500))
	{//Phoenix Crown
		n_tok[bon_RED_BOSS] += n_A_HEAD_DEF_PLUS;
	}
	if(EquipNumSearch(1513) && CardNumSearch(31))
	{//Lord of the Dead Helm
		if (n_A_HEAD_DEF_PLUS >= 11) n_tok[bon_RED_NON_BOSS] += 5;
	}

	// Sanctuary. Not sure why this is here...
	if ( EquipNumSearch( 1085 ) )
	{
		if(n_A_Weapon_ATKplus >= 6)
		{
			n_tok[bon_SANC_MUL] += 5;
		}
		if(n_A_Weapon_ATKplus >= 10)
		{
			n_tok[bon_SANC_MUL] += 5;
		}
	}
	if ( EquipNumSearch( 1338 ) && n_A_HEAD_DEF_PLUS >= 7 )
	{ // Cancer Diadem
		n_tok[bon_SANC_MUL] += 3;
	}
	if ( EquipNumSearch( 1339 ) && n_A_HEAD_DEF_PLUS >= 9 )
	{ // Capricorn Diadem
		n_tok[bon_SANC_MUL] += 4;
	}

	// Status Reductions
	if ( EquipNumSearch(534) )
	{
		wSPVS = n_A_JobSearch();
		if(wSPVS==1 || wSPVS==2 || wSPVS==6)
			n_tok[bon_RES_STATUS_STUN] += 50;
		if(wSPVS==3 || wSPVS==4 || wSPVS==5)
			n_tok[bon_RES_STATUS_SILENCE] += 50;
	}
	if ( EquipNumSearch(828) )
	{
		n_tok[bon_RES_STATUS_STUN] += 2 * n_A_HEAD_DEF_PLUS;
		n_tok[bon_RES_STATUS_FREEZE] += 2 * n_A_HEAD_DEF_PLUS;
		n_tok[bon_RES_STATUS_STONE] += 2 * n_A_HEAD_DEF_PLUS;
	}
	if ( CardNumSearch(176) )
	{
		if (SU_AGI >= 90 )
		{
			n_tok[bon_RES_STATUS_STUN] += 30 * CardNumSearch(176);
			n_tok[bon_RES_STATUS_SILENCE] += 30 * CardNumSearch(176);
		}
		if ( SU_VIT >= 80 )
		{
			n_tok[bon_RES_STATUS_SLEEP] += 50 * CardNumSearch(176);
			n_tok[bon_RES_STATUS_STONE] += 50 * CardNumSearch(176);
		}
	}
	if ( miscEffects[ksPetEffects] == 42 && EquipNumSearch(1218))
	{
		n_tok[bon_RES_STATUS_STUN] += 10;
	}
	if ( SkillSearch( skill_ROY_SHIELD_SPELL ) === 3 )
	{ // Shield Spell status effect resistance: [(Shield Upgrade x 2) + (Caster’s LUK / 10)] %
		var resistanceBonus = Math.floor( ( n_A_LEFT_DEF_PLUS * 2 ) + ( n_A_LUK / 10.0 ) );
		for ( var i = bon_RES_STATUS_POISON; i <= bon_RES_STATUS_STONE; i++ )
		{
			n_tok[i] += resistanceBonus;
		}
	}

}
var enemySkills = [ //0 normal atk, 1 ign def, 2 mdef based, 3 mdef ign, 4 ranged, 5 ranged ign def
//-1 non elemental -2 element dependent
["Basic Attack", 0,-1, 1], // baseAtk.
["Random (Elemental) Attack", 0,-2, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // ELEMENT ATTACK
["Piercing Attack", 1,-1, 1], // PIERCINGATT. 1 = ignoring def
["Self Destruction", 1,-1, 1], // SELFDESTRUCTION
["Combo Attack", 0,-1, 1], // COMBOATTACK
["Critical Hit", 0,-1, 1.4], // CRITICALSLASH
["Splash Attack", 0, ele_NEUTRAL, 1],
["Dark Cross", 0,ele_DARK, 1.35, 1.7, 2.05, 2.4, 2.75, 3.1, 3.45, 3.8, 4.15, 4.50], // DARKCROSS
["Dark Strike", 2,ele_DARK, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5], // DARKSTRIKE
["Dark Thunder", 2,ele_DARK, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // DARKTHUNDER
["Ranged Attack", 4,-1, 1], // RANGEDATT
//["Break (Armor, Weapon, Shield, Helm)", 0, ele_NEUTRAL, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],

["Shadow Property Attack", 0, ele_DARK, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
["Fire Property Attack", 0, ele_FIRE, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
["Earth Property Attack", 0, ele_EARTH, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
["Holy Property Attack", 0, ele_HOLY, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
["Water Property Attack", 0, ele_WATER, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
["Poison Property Attack", 0, ele_POISON, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
["Ghost Property Attack", 0, ele_GHOST, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
["Undead Property Attack", 0, ele_UNDEAD, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
["Wind Property Attack", 0, ele_WIND, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],

["Blood Drain", 0, ele_DARK, 1],
["Energy Drain", 0, ele_DARK, 1],
["Exile", 4, ele_NEUTRAL, 1],
["Fatal Wound", 0, ele_NEUTRAL, 1],
["Petrify Attack", 0, ele_EARTH, 1],
["Curse Attack", 0, ele_DARK, 1],
["Poison(ing) Attack", 0, ele_POISON, 1],
["Sleep Attack", 0, ele_NEUTRAL, 1],
["Stun Attack", 0, ele_NEUTRAL, 1],
["Blind Attack", 0, ele_DARK, 1],

["Grand Cross of Darkness", 1,ele_DARK, 1.4, 1.8, 2.2, 2.6, 3, 3.4, 3.8, 4.2, 4.6, 5], // GRANDDARKNESS
["Hell's Judgement", 0, ele_NEUTRAL, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // HELLJUDGEMENT
["Ice Breath", 0, ele_WATER, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // ICEBREATH
["Fire Breath", 0, ele_FIRE, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // FIREBREATH
["Acid Breath", 0, ele_POISON, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // ACIDBREATH
["Thunder Breath", 0, ele_WIND, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // ACIDBREATH
["Pulse Strike", 0,-1, 1, 2, 3, 4, 5], // PULSESTRIKE
["Vampire Gift", 0,ele_NEUTRAL, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5], // VAMPIRE GIFT
["Earthquake (non-ranged)", 1,ele_NEUTRAL, 3*3, 5*3, 6*3, 8*3, 10*3, 12*3, 13*3, 15*3, 16*3, 18*3], // EARTHQUAKE
["Earthquake (ranged)", 5,ele_NEUTRAL, 3*3, 5*3, 6*3, 8*3, 10*3, 12*3, 13*3, 15*3, 16*3, 18*3], // EARTHQUAKE

]

function calcIncomingDamage()
{ // incoming damage - return avg
	w_HiDam = new Array();
	wBHD = n_B[en_MAXATK];
	var skill_formula = enemySkills[n_A_MobSkill][n_A_MobSkillLV+2];
	var start_w_HiDam = new Array();
	w_HiDam[0] = n_B[en_MINATK] * skill_formula; // Atk (Min)
	w_HiDam[1] = ((n_B[en_MINATK] *5 + wBHD) /6) * skill_formula;
	w_HiDam[2] = ((n_B[en_MINATK] *4 + wBHD *2) /6) * skill_formula;
	w_HiDam[3] = ((n_B[en_MINATK] + wBHD) /2) * skill_formula;
	w_HiDam[4] = ((n_B[en_MINATK] *2 + wBHD *4) /6) * skill_formula;
	w_HiDam[5] = ((n_B[en_MINATK] + wBHD *5) /6) * skill_formula;
	w_HiDam[6] = wBHD * skill_formula;
	if(n_B[en_MINATK] == n_B[en_MAXATK])
		w_HiDam[6] = (wBHD - 1) * skill_formula;

	if (n_A_MobSkill == 2) {
		for (var i = 0; i < 7; i++)
			w_HiDam[i] = n_B[en_HP];
	}
	for (var i = 0; i < 7; i++)
		start_w_HiDam[i] = w_HiDam[i];

	if ( SkillSearch( skill_AC_DIVINE_PROTECTION ) && (n_B[en_ELEMENT] >= 90 || n_B[en_RACE] === 6 ) )
	{ // Divine Protection
		wBHD = Math.floor( ( 3 + 4 / 100 * n_A_BaseLV ) * SkillSearch( skill_AC_DIVINE_PROTECTION ) );

		for ( var i = 0; i <= 6; i++ )
		{
			w_HiDam[i] -= wBHD;
		}
	}
	if ( ( n_B[en_ELEMENT] >= ( ele_EARTH * 10 ) && n_B[en_ELEMENT] <= ( ele_EARTH * 10 + 9 ) ) ||
	     ( n_B[en_ELEMENT] >= ( ele_FIRE * 10) && n_B[en_ELEMENT] <= ( ele_FIRE * 10 + 9 ) ) )
	{ // Fire and Earth Research
		wBHD = 10 * SkillSearch( skill_MEC_RESEARCH_FIRE_EARTH );

		for ( var i = 0; i <= 6; i++ )
		{
			w_HiDam[i] -= wBHD;
		}
	}
	if ( n_B[en_RACE] === race_BRUTE || n_B[en_RACE] === race_PLANT || n_B[en_RACE] === race_FISH )
	{ // Ranger Main
		wBHD = 5 * SkillSearch( skill_RAN_RANGER_MAIN );

		for ( var i = 0; i <= 6; i++ )
		{
			w_HiDam[i] -= wBHD;
		}
	}
	if ( SkillSearch( skill_TKM_SOLAR_PROTECTION ) )
	{ // Solar Protection
		wBHD = Math.floor((n_A_BaseLV + n_A_LUK + n_A_DEX) / 2);

		for ( var i = 0; i <= 6; i++ )
		{
			w_HiDam[i] -= wBHD;
		}
	}
	if (enemySkills[n_A_MobSkill][2] >= 0) {
		wBHD = n_tok[bon_RED_ELE_NEUTRAL + enemySkills[n_A_MobSkill][2]];
		// Forced neutral skills affected by armor enchants
		armor = element[n_A_BodyZokusei * 10 +1][ele_NEUTRAL + enemySkills[n_A_MobSkill][2]] / 100;
		wBHD = 100 - ((100 - wBHD)*armor);
	}
	else if (enemySkills[n_A_MobSkill][2] == -1) {
		wBHD = n_tok[bon_RED_ELE_NEUTRAL];
	} else if (enemySkills[n_A_MobSkill][2] == -2) {
		wBHD = n_tok[bon_RED_ELE_NEUTRAL+Math.floor(n_B[en_ELEMENT]/8)-1]; // + element
	}
	if(wBHD != 0)
	{
		for(i=0;i<=6;i++)
			w_HiDam[i] -= Math.floor(w_HiDam[i] * wBHD /100);
	}

	if(SkillSearch(skill_MA_ENERGY_COAT))
	{
		wBHD = 6 * SkillSearch(skill_MA_ENERGY_COAT);
		for(i=0;i<=6;i++)
			w_HiDam[i] -= Math.floor(w_HiDam[i] * wBHD /100);
	}

	wBHD = n_tok[bon_RED_RC_FORMLESS+n_B[en_RACE]];
	if(wBHD != 0)
	{
		for(i=0;i<=6;i++)
			w_HiDam[i] -= Math.floor(w_HiDam[i] * wBHD /100);
	}

	wBHD = n_tok[bon_RED_SIZ_SMALL+n_B[en_SIZE]];
	if(wBHD != 0)
	{
		for(i=0;i<=6;i++)
			w_HiDam[i] -= Math.floor(w_HiDam[i] * wBHD /100);
	}

	if(n_B[en_BOSS] == 0){
		wBHD = n_tok[bon_RED_NONBOSS];
		for(i=0;i<=6;i++)
			w_HiDam[i] -= Math.floor(w_HiDam[i] * wBHD /100);
	}

	if(n_B[en_RANGED] || enemySkills[n_A_MobSkill][1] == 4 || enemySkills[n_A_MobSkill][1] == 5){
		wBHD = n_tok[bon_RED_RANGE];
		for(i=0;i<=6;i++)
			w_HiDam[i] -= Math.floor(w_HiDam[i] * wBHD /100);

		if(SkillSearch(skill_CR_DEFENDING_AURA)){
			wBHD = 5 + 15 * SkillSearch(skill_CR_DEFENDING_AURA);
			for(i=0;i<=6;i++)
				w_HiDam[i] -= Math.floor(w_HiDam[i] * wBHD /100);
		}
	}

	if(n_B[en_BOSS]==1){
		for(i=0;i<=6;i++)
			w_HiDam[i] -= Math.floor(w_HiDam[i] * n_tok[bon_RED_BOSS] /100);

	}

	if(TimeItemNumSearch(temp_ULFHEDINN))
		for(i=0;i<=6;i++)
			w_HiDam[i] -= Math.floor(w_HiDam[i] * 20 /100);


	wBHD = n_tok[330 + Math.floor(n_B[en_ELEMENT] / 10)]; // New shieldcards ?
	if(wBHD != 0){
		for(i=0;i<=6;i++)
			w_HiDam[i] -= Math.floor(w_HiDam[i] * wBHD /100);
	}

	wBHD = StPlusCard(bon_RED_MONSTER+n_B[en_ID]);
	wBHD += StPlusCalc2(bon_RED_MONSTER+n_B[en_ID]);
	for(i=0;i<=6;i++)
		w_HiDam[i] -= Math.floor(w_HiDam[i] * wBHD /100);

	// player defense
	if (enemySkills[n_A_MobSkill][1] % 2 == 0)
	{
		for ( var i = 0; i <= 6; i++ )
		{
			var _def = n_A_totalDEF;
			if (enemySkills[n_A_MobSkill][n_A_MobSkillLV+1] == 2) _def = n_A_totalMDEF;
			w_HiDam[i] = w_HiDam[i] * defReduction(_def);
			if (enemySkills[n_A_MobSkill][n_A_MobSkillLV+1] == 2)
				w_HiDam[i] = w_HiDam[i] - n_A_INTDEF;
			else w_HiDam[i] = w_HiDam[i] - n_A_VITDEF;
		}
	}

	if(SkillSearch(skill_MO_STEEL_BODY))
	{
		for(i=0;i<=6;i++)
			w_HiDam[i] = Math.floor(w_HiDam[i] * 10 /100);
	}

	for(i=0;i<=6;i++)
	{ // MinDmg 1
		w_HiDam[i]=Max(1,w_HiDam[i]);
	}

	if(battleChantBuffs[pass_V_DAMAGE])
		for(i=0;i<=6;i++)
			w_HiDam[i] = Math.floor(w_HiDam[i] / 2);

	w_HiDam[0] = Math.floor(w_HiDam[0]);
	w_HiDam[6] = Math.floor(w_HiDam[6]);


	wBHD=0;
	for(i=0;i<=6;i++)
		wBHD += w_HiDam[i];
	wBHD = Math.round(wBHD / 7);

	var name64 = GetWord(65);
	var wRefStr = "";
	if(PlayerVersusPlayer==0)
	{
		var asm=1;
		if(acolyteBuffs[ksAssumptio])
		{
			asm = 2;
		}
		if(SkillSearch(skill_CR_SHIELD_REFLECT))
		{
			var wRSnum = (10 + 3 * SkillSearch(skill_CR_SHIELD_REFLECT)) * asm;
			var wRef1 = new Array();
			wRef1[0] = Math.floor(wBHD * wRSnum / 100);
			wRef1[1] = Math.floor(w_HiDam[0] * wRSnum / 100);
			wRef1[2] = Math.floor(w_HiDam[6] * wRSnum / 100);
			wRefStr += "<BR><Font color='Blue'><B>"+ wRef1[0] +" ("+ wRef1[1] +"~"+ wRef1[2] +")</B>";
			name64 += "<BR><Font color=Blue><B>Damage Reflected</B></Font>";
		}

		if ( EquipNumSearch( 535 ) )
		{ // Valk Mant Reflect
			var wVM = n_A_JobSearch();
			if ( wVM == 1 || wVM == 2 || wVM == 6 )
			{
				n_tok[bon_REFLECT_PHY_DMG] += 5 + n_A_SHOULDER_DEF_PLUS * 2;
			}
		}
		if(n_tok[bon_REFLECT_PHY_DMG])
		{
			var wRef2 = new Array();
			var w = n_tok[bon_REFLECT_PHY_DMG] * asm;
			wRef2[0] = Math.floor(wBHD * w / 100);
			wRef2[1] = Math.floor(w_HiDam[0] * w / 100);
			wRef2[2] = Math.floor(w_HiDam[6] * w / 100);
			wRefStr += "<BR><Font color='Blue'><B>"+ wRef2[0] +" ("+ wRef2[1] +"~"+ wRef2[2] +")</B>";
			name64 += "<BR><Font color=Blue><B>Damage Reflected</B></Font>";
		}
	}
	reduct = "<br/>("+(Math.floor(100 - w_HiDam[0]/start_w_HiDam[0]*100))+"% reduction)"
	myInnerHtml( "nm065", name64, 0 );
	myInnerHtml("B_AveAtk",wBHD +" ("+ w_HiDam[0] +"~"+ w_HiDam[6]+")"+ wRefStr + reduct,0);

	// Include Flee/ PDodge ---------------------------------
	wBHD = Math.round(wBHD *(100-n_A_LUCKY))/100;
	wBHD = Math.round(wBHD *(100-w_FLEE))/100;

	if(SkillSearch(skill_CR_GUARD))
		wBHD = Math.round(wBHD * w_AG[SkillSearch(skill_CR_GUARD)])/100;

	if(n_A_WeaponType==weapTyp_SWORDII && SkillSearch(skill_LK_PARRYING))
		wBHD = Math.round(wBHD * (80- SkillSearch(skill_LK_PARRYING) *3))/100;

	if(SkillSearch(skill_ST_COUNTER_INSTINCT))
		wBHD = Math.round(wBHD * (100- SkillSearch(skill_ST_COUNTER_INSTINCT) *7.5))/100;

	myInnerHtml("B_Ave2Atk",wBHD+" Damage",0);
}

function CalcSkillModAdditions( skillMod )
{ // skillmod + x
	// Power Thrust and Maximum Power Thrust
	if ( SkillSearch( skill_MS_MAXIMUM_POWER_THUST ) )
	{
		skillMod += 20 * SkillSearch( skill_MS_MAXIMUM_POWER_THUST );
	}
	else
	{
		if ( SkillSearch( skill_BS_POWER_THRUST ) )
		{
			skillMod += SkillSearch( skill_BS_POWER_THRUST ) * 5;
		}
		else if ( otherBuffs[ksPowerThrust] )
		{
			skillMod += 5;
		}
	}

	// Spear Dynamo
	if ( SkillSearch( skill_LK_SPEAR_DYNAMO ) )
	{
		skillMod += SkillSearch( skill_LK_SPEAR_DYNAMO ) * 5;
	}

	// Falcon Eyes
	if ( SkillSearch( skill_SN_FALCON_EYES ) )
	{
		skillMod += SkillSearch( skill_SN_FALCON_EYES ) * 2;
	}

	// Kihop
	if ( SkillSearch( skill_TK_KIHOP ) )
	{
		skillMod += 2 * SkillSearch( skill_TK_KIHOP ) * SkillSearch( skill_TK_KIHOP_PARTY );
	}

	return skillMod;
}
