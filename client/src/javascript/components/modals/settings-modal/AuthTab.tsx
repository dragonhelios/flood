import classnames from 'classnames';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {FC, useEffect, useRef, useState} from 'react';
import {observer} from 'mobx-react';
import {Trans, useLingui} from '@lingui/react';

import {Button, Checkbox, Form, FormError, FormRow, FormRowItem, LoadingRing, Textbox} from '@client/ui';
import {Close, Edit} from '@client/ui/icons';
import AuthActions from '@client/actions/AuthActions';
import AuthStore from '@client/stores/AuthStore';

import {AccessLevel} from '@shared/schema/constants/Auth';

import type {Credentials} from '@shared/schema/Auth';
import type {ClientConnectionSettings} from '@shared/schema/ClientConnectionSettings';

import ClientConnectionSettingsForm from '../../general/connection-settings/ClientConnectionSettingsForm';
import ModalFormSectionHeader from '../ModalFormSectionHeader';

interface AuthTabFormData {
  username: string;
  password: string;
  isAdmin: boolean;
}

const AuthTab: FC = observer(() => {
  const formRef = useRef<Form>(null);
  const clientConnectionSettingsRef = useRef<ClientConnectionSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUserListFetched, setIsUserListFetched] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<Credentials | null>(null);
  const {i18n} = useLingui();

  useEffect(() => {
    if (AuthStore.currentUser.isAdmin) {
      AuthActions.fetchUsers().then(() => {
        setIsUserListFetched(true);
      });
    }
  }, []);

  if (!AuthStore.currentUser.isAdmin) {
    return (
      <Form>
        <ModalFormSectionHeader>
          <Trans id="auth.user.accounts"/>
        </ModalFormSectionHeader>
        <FormRow>
          <FormError>
            <Trans id="auth.message.not.admin"/>
          </FormError>
        </FormRow>
      </Form>
    );
  }

  const isLoading = !isUserListFetched && AuthStore.users.length === 0;
  const interactiveListClasses = classnames('interactive-list', {
    'interactive-list--loading': isLoading,
  });

  function updateUser(user: Credentials) {
    if (user) {
      setSelectedUser(user);
      setUserName(user.username);
      setIsAdmin(user.level === AccessLevel.ADMINISTRATOR);
      setIsUpdating(true);
    }
  }

  function handleNameChange(event:HTMLInputElement) {
    setUserName(event.value);
  }

  function cancelUpdateUser() {

    setSelectedUser({
      username: '',
      password: '',
      client: {
        client: 'rTorrent',
        type: 'rpc',
        username: '',
        password: '',
        url: '',
        version: 1,
      },
      level: AccessLevel.USER
    });
    setUserName('');
    setIsAdmin(false);
    setIsUpdating(false);
    formRef?.current?.resetForm();
  }

  return (
    <Form
      onSubmit={() => {
        if (formRef.current == null || clientConnectionSettingsRef.current == null) {
          return;
        }

        const formData = formRef.current.getFormData() as Partial<AuthTabFormData>;

        if (formData.username == null || formData.username === '') {
          setError('auth.error.username.empty');
        } else if (formData.password == null || formData.password === '') {
          setError('auth.error.password.empty');
        } else {
          setIsSubmitting(true);

          const connectionSettings = clientConnectionSettingsRef.current;
          if (connectionSettings == null) {
            setError('connection.settings.error.empty');
            setIsSubmitting(false);
            return;
          }

          if (isUpdating && selectedUser) {
            AuthActions.updateUser(selectedUser.username, {
              username: formData.username,
              password: formData.password,
              client: connectionSettings,
              level: formData.isAdmin === true ? AccessLevel.ADMINISTRATOR : AccessLevel.USER,
            })
              .then(
                () => {
                  cancelUpdateUser();
                  if (formRef.current != null) {
                    formRef.current.resetForm();
                  }
                  setError(null);
                  setIsSubmitting(false);
                },
                () => {
                  setError('general.error.unknown');
                  setIsSubmitting(false);
                },
              )
              .then(AuthActions.fetchUsers);
            return;
          }

          AuthActions.createUser({
            username: formData.username,
            password: formData.password,
            client: connectionSettings,
            level: formData.isAdmin === true ? AccessLevel.ADMINISTRATOR : AccessLevel.USER,
          })
            .then(
              () => {
                if (formRef.current != null) {
                  formRef.current.resetForm();
                }
                setError(null);
                setIsSubmitting(false);
              },
              () => {
                setError('general.error.unknown');
                setIsSubmitting(false);
              },
            )
            .then(AuthActions.fetchUsers)
        }
      }}
      ref={formRef}>
      <ModalFormSectionHeader>
        <Trans id="auth.user.accounts"/>
      </ModalFormSectionHeader>
      <FormRow>
        <FormRowItem>
          <ul className={interactiveListClasses}>
            <TransitionGroup>
              {isLoading && (
                <CSSTransition classNames="interactive-list__loading-indicator" timeout={{enter: 250, exit: 250}}>
                  <div className="interactive-list__loading-indicator" key="loading-indicator">
                    <LoadingRing />
                  </div>
                </CSSTransition>
              )}
            </TransitionGroup>
            {AuthStore.users
              .slice()
              .sort((a: Credentials, b: Credentials) => a.username.localeCompare(b.username))
              .map((user: Credentials) => {
                const isCurrentUser = user.username === AuthStore.currentUser.username;
                let badge = null;
                let removeIcon = null;

                const updateIcon = (
                  <button
                    className="interactive-list__icon interactive-list__icon--action interactive-list__icon--action--danger"
                    type="button"
                    onClick={() => updateUser(user)}
                    disabled={isUpdating}
                    style={{marginLeft: '5px'}}>
                    <Edit/>
                  </button>
                );

                if (!isCurrentUser) {
                  removeIcon = (
                    <button
                      className='interactive-list__icon interactive-list__icon--action interactive-list__icon--action--warning'
                      type="button"
                      disabled={isUpdating}
                      onClick={() => AuthActions.deleteUser(user.username).then(AuthActions.fetchUsers)}>
                      <Close/>
                    </button>
                  );
                } else {
                  badge = (
                    <span className="interactive-list__label__tag tag">
                      <Trans id="auth.current.user"/>
                    </span>
                  );
                }

                const classes = classnames('interactive-list__item', {
                  'interactive-list__item--disabled': isCurrentUser,
                });

                return (
                  <li className={classes} key={user.username}>
                    <span className="interactive-list__label">
                      <div className="interactive-list__label__text">{user.username}</div>
                      {badge}
                    </span>
                    {updateIcon}
                    {removeIcon}
                  </li>
                );
              })}
          </ul>
        </FormRowItem>
      </FormRow>
      <ModalFormSectionHeader>
        <Trans id={isUpdating ? "auth.edit.user" : "auth.add.user"}/>
      </ModalFormSectionHeader>
      {error && (
        <FormRow>
          <FormError>{i18n._(error)}</FormError>
        </FormRow>
      )}
      <FormRow>
        <Textbox
          id="username"
          label={<Trans id="auth.username"/>}
          placeholder={i18n._('auth.username')}
          autoComplete="username"
          value={userName}
          onChange={(element) => handleNameChange(element.target)}
        />
        <Textbox
          id="password"
          label={<Trans id="auth.password"/>}
          placeholder={i18n._('auth.password')}
          autoComplete="new-password"
          type="password"
        />
        <Checkbox grow={false} id="isAdmin" labelOffset matchTextboxHeight
                  checked={isAdmin}
                  onClick={() => setIsAdmin(!isAdmin)}
        >
          <Trans id="auth.admin"/>
        </Checkbox>
      </FormRow>
      <ClientConnectionSettingsForm
        onSettingsChange={(settings) => {
          clientConnectionSettingsRef.current = settings;
        }}
        initialSettings={selectedUser?.client}
      />
      <p/>
      <FormRow justify="end">
        <Button isLoading={isSubmitting} priority="primary" type="submit" disabled={!isUpdating} onClick={() => cancelUpdateUser()}>
          <Trans id="button.cancel"/>
        </Button>
        <Button isLoading={isSubmitting} priority="primary" type="submit">
          <Trans id={isUpdating?"button.update":"button.add"}/>
        </Button>
      </FormRow>
    </Form>
  )
    ;
});

export default AuthTab;
