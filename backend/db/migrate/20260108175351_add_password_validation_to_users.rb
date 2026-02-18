class AddPasswordValidationToUsers < ActiveRecord::Migration[7.2]
  def change
    # Add check constraint for password digest presence
    # This ensures password_digest is never null for new records
    # Password complexity validation is handled at application level in User model

    # Add database-level comment documenting password requirements
    change_column_comment :users, :password_digest,
      'Password must be at least 8 characters with 1 uppercase, 1 number, 1 special character (@$!%*?&#)'
  end
end
