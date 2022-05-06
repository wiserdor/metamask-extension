import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { PRIMARY, SECONDARY } from '../../../helpers/constants/common';

import { addHexes } from '../../../helpers/utils/conversions.util';
import UserPreferencedCurrencyDisplay from '../../../components/app/user-preferenced-currency-display/user-preferenced-currency-display.component';
import GasTiming from '../../../components/app/gas-timing/gas-timing.component';
import InfoTooltip from '../../../components/ui/info-tooltip/info-tooltip';
import Typography from '../../../components/ui/typography/typography';
import Button from '../../../components/ui/button';
import { TYPOGRAPHY } from '../../../helpers/constants/design-system';
import LoadingHeartBeat from '../../../components/ui/loading-heartbeat';
import { hexWEIToDecGWEI } from '../../../helpers/utils/conversions.util';
import TransactionDetailItem from '../../../components/app/transaction-detail-item/transaction-detail-item.component';
import { NETWORK_TO_NAME_MAP } from '../../../../shared/constants/network';
import TransactionDetail from '../../../components/app/transaction-detail/transaction-detail.component';
import ActionableMessage from '../../../components/ui/actionable-message/actionable-message';

const renderHeartBeatIfNotInTest = () =>
  process.env.IN_TEST ? null : <LoadingHeartBeat />;
export default class GasDisplay extends Component {
  static contextTypes = {
    t: PropTypes.func,
    trackEvent: PropTypes.func,
  };

  render() {
    const {
      primaryTotalTextOverride,
      secondaryTotalTextOverride,
      hexTransactionTotal,
      useNonceField,
      customNonceValue,
      updateCustomNonce,
      nextNonce,
      getNextNonce,
      draftTransaction,
      useNativeCurrencyAsPrimaryCurrency,
      primaryTotalTextOverrideMaxAmount,
      maxFeePerGas,
      maxPriorityFeePerGas,
      isMainnet,
      showLedgerSteps,
      showBuyModal,
      isBuyableChain,
      hexMinimumTransactionFee,
      hexMaximumTransactionFee,
      nativeCurrency,
      chainId,
      showAccountDetails,
    } = this.props;
    const { t } = this.context;

    const networkName = NETWORK_TO_NAME_MAP[chainId];

    const nonceField = useNonceField ? (
      <div>
        <div className="confirm-detail-row">
          <div className="confirm-detail-row__label">
            {t('nonceFieldHeading')}
          </div>
          <div className="custom-nonce-input">
            <TextField
              type="number"
              min="0"
              placeholder={
                typeof nextNonce === 'number' ? nextNonce.toString() : null
              }
              onChange={({ target: { value } }) => {
                if (!value.length || Number(value) < 0) {
                  updateCustomNonce('');
                } else {
                  updateCustomNonce(String(Math.floor(value)));
                }
                getNextNonce();
              }}
              fullWidth
              margin="dense"
              value={customNonceValue || ''}
            />
          </div>
        </div>
      </div>
    ) : null;

    const renderTotalMaxAmount = () => {
      if (
        primaryTotalTextOverrideMaxAmount === undefined &&
        secondaryTotalTextOverride === undefined
      ) {
        // Native Send
        return (
          <UserPreferencedCurrencyDisplay
            type={PRIMARY}
            key="total-max-amount"
            value={addHexes(
              draftTransaction.txParams.value,
              hexMaximumTransactionFee,
            )}
            hideLabel={!useNativeCurrencyAsPrimaryCurrency}
          />
        );
      }
      // Token send
      return useNativeCurrencyAsPrimaryCurrency
        ? primaryTotalTextOverrideMaxAmount
        : secondaryTotalTextOverride;
    };

    const renderTotalDetailTotal = () => {
      if (
        primaryTotalTextOverride === undefined &&
        secondaryTotalTextOverride === undefined
      ) {
        return (
          <div className="confirm-page-container-content__total-value">
            <LoadingHeartBeat
              estimateUsed={this.props.draftTransaction?.userFeeLevel}
            />
            <UserPreferencedCurrencyDisplay
              type={PRIMARY}
              key="total-detail-value"
              value={hexTransactionTotal}
              hideLabel={!useNativeCurrencyAsPrimaryCurrency}
            />
          </div>
        );
      }
      return useNativeCurrencyAsPrimaryCurrency
        ? primaryTotalTextOverride
        : secondaryTotalTextOverride;
    };

    const renderTotalDetailText = () => {
      if (
        primaryTotalTextOverride === undefined &&
        secondaryTotalTextOverride === undefined
      ) {
        return (
          <div className="confirm-page-container-content__total-value">
            <LoadingHeartBeat estimateUsed={this.props.txData?.userFeeLevel} />
            <UserPreferencedCurrencyDisplay
              type={SECONDARY}
              key="total-detail-text"
              value={hexTransactionTotal}
              hideLabel={Boolean(useNativeCurrencyAsPrimaryCurrency)}
            />
          </div>
        );
      }
      return useNativeCurrencyAsPrimaryCurrency
        ? secondaryTotalTextOverride
        : primaryTotalTextOverride;
    };

    const renderGasDetailsItem = () => {
      return this.supportsEIP1559V2 ? (
        <GasDetailsItem
          key="gas_details"
          userAcknowledgedGasMissing={userAcknowledgedGasMissing}
        />
      ) : (
        <div className="transaction-item">
          <TransactionDetailItem
            key="gas-item"
            detailTitle={
              <>
                {t('transactionDetailGasHeading')}
                <InfoTooltip
                  contentText={
                    <>
                      <p>
                        {t('transactionDetailGasTooltipIntro', [
                          isMainnet ? t('networkNameEthereum') : '',
                        ])}
                      </p>
                      <p>{t('transactionDetailGasTooltipExplanation')}</p>
                      <p>
                        <a
                          href="https://community.metamask.io/t/what-is-gas-why-do-transactions-take-so-long/3172"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t('transactionDetailGasTooltipConversion')}
                        </a>
                      </p>
                    </>
                  }
                  position="top"
                >
                  <i className="fa fa-info-circle" />
                </InfoTooltip>
              </>
            }
            detailText={
              <div className="confirm-page-container-content__currency-container test">
                {renderHeartBeatIfNotInTest()}
                <UserPreferencedCurrencyDisplay
                  type={SECONDARY}
                  value={hexMinimumTransactionFee}
                  hideLabel={Boolean(useNativeCurrencyAsPrimaryCurrency)}
                />
              </div>
            }
            detailTotal={
              <div className="confirm-page-container-content__currency-container">
                {renderHeartBeatIfNotInTest()}
                <UserPreferencedCurrencyDisplay
                  type={PRIMARY}
                  value={hexMinimumTransactionFee}
                  hideLabel={!useNativeCurrencyAsPrimaryCurrency}
                  numberOfDecimals={6}
                />
              </div>
            }
            subText={
              <>
                <strong key="editGasSubTextFeeLabel">
                  {t('editGasSubTextFeeLabel')}
                </strong>
                <div
                  key="editGasSubTextFeeValue"
                  className="confirm-page-container-content__currency-container"
                >
                  {renderHeartBeatIfNotInTest()}
                  <UserPreferencedCurrencyDisplay
                    key="editGasSubTextFeeAmount"
                    type={PRIMARY}
                    value={hexMaximumTransactionFee}
                    hideLabel={!useNativeCurrencyAsPrimaryCurrency}
                  />
                </div>
              </>
            }
            subTitle={
              <>
                <GasTiming
                  maxPriorityFeePerGas={hexWEIToDecGWEI(
                    maxPriorityFeePerGas ||
                      draftTransaction.txParams.maxPriorityFeePerGas,
                  )}
                  maxFeePerGas={hexWEIToDecGWEI(
                    maxFeePerGas || draftTransaction.txParams.maxFeePerGas,
                  )}
                />
              </>
            }
          />
        </div>
      );
    };

    return (
      <>
        {renderGasDetailsItem}
        <div className="gas-display">
          <TransactionDetail
            userAcknowledgedGasMissing={false}
            rows={[
              renderGasDetailsItem(),
              !this.supportsEIP1559V2 && (
                <TransactionDetailItem
                  key="total-item"
                  detailTitle={t('total')}
                  detailText={renderTotalDetailText()}
                  detailTotal={renderTotalDetailTotal()}
                  subTitle={t('transactionDetailGasTotalSubtitle')}
                  subText={
                    <div className="confirm-page-container-content__total-amount">
                      <LoadingHeartBeat
                        estimateUsed={this.props.draftTransaction?.userFeeLevel}
                      />
                      <strong key="editGasSubTextAmountLabel">
                        {t('editGasSubTextAmountLabel')}
                      </strong>{' '}
                      {renderTotalMaxAmount()}
                    </div>
                  }
                />
              ),
            ]}
          />
          {nonceField}
          {showLedgerSteps ? (
            <LedgerInstructionField
              showDataInstruction={Boolean(txData.txParams?.data)}
            />
          ) : null}
        </div>
        {!this.supportsEIP1559V2 && (
          <div className="confirm-approve-content__warning">
            <ActionableMessage
              message={
                isBuyableChain ? (
                  <Typography variant={TYPOGRAPHY.H7} align="left">
                    {t('insufficientCurrencyBuyOrReceive', [
                      nativeCurrency,
                      networkName,
                      <Button
                        type="inline"
                        className="confirm-page-container-content__link"
                        onClick={showBuyModal}
                        key={`${nativeCurrency}-buy-button`}
                      >
                        {t('buyAsset', [nativeCurrency])}
                      </Button>,
                      <Button
                        type="inline"
                        className="gas-display__link"
                        onClick={showAccountDetails}
                        key={'receive-button'}
                      >
                        {t('receive')}
                      </Button>,
                    ])}
                  </Typography>
                ) : (
                  <Typography variant={TYPOGRAPHY.H7} align="left">
                    {t('insufficientCurrencyBuyOrReceive', [
                      nativeCurrency,
                      networkName,
                      <Button
                        type="inline"
                        className="gas-display__link"
                        onClick={showAccountDetails}
                        key={'receive-button'}
                      >
                        {t('receive')}
                      </Button>,
                    ])}
                  </Typography>
                )
              }
              useIcon
              iconFillColor="var(--color-error-default)"
              type="danger"
            />
          </div>
        )}
      </>
    );
  }
}
